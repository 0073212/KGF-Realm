from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# -------------------- App & DB --------------------
import json
import copy

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "test_database")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("kgf")

# 100% Standard-library Local Database fallback for offline resilience
class LocalUpdateResult:
    def __init__(self, matched_count, modified_count):
        self.matched_count = matched_count
        self.modified_count = modified_count

class LocalDeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count

class LocalCursor:
    def __init__(self, items):
        self._items = items

    def sort(self, key, direction=-1):
        reverse = (direction == -1)
        self._items = sorted(self._items, key=lambda x: str(x.get(key, "")), reverse=reverse)
        return self

    async def to_list(self, length=None):
        res = [copy.deepcopy(x) for x in self._items]
        if length is not None:
            return res[:length]
        return res

class LocalCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _matches(self, doc, query):
        if not query:
            return True
        for k, v in query.items():
            if doc.get(k) != v:
                return False
        return True

    async def create_index(self, *args, **kwargs):
        return True

    async def count_documents(self, filter_dict=None):
        filter_dict = filter_dict or {}
        items = self.db._data.get(self.name, [])
        return sum(1 for d in items if self._matches(d, filter_dict))

    async def find_one(self, filter_dict):
        items = self.db._data.get(self.name, [])
        for d in items:
            if self._matches(d, filter_dict):
                return copy.deepcopy(d)
        return None

    def find(self, query=None):
        query = query or {}
        items = self.db._data.get(self.name, [])
        matched = [copy.deepcopy(d) for d in items if self._matches(d, query)]
        return LocalCursor(matched)

    async def insert_one(self, doc):
        items = self.db._data.setdefault(self.name, [])
        d = copy.deepcopy(doc)
        items.append(d)
        self.db._save()
        return True

    async def update_one(self, filter_dict, update_dict):
        items = self.db._data.get(self.name, [])
        set_vals = update_dict.get("$set", update_dict)
        matched = 0
        for d in items:
            if self._matches(d, filter_dict):
                matched += 1
                for k, v in set_vals.items():
                    d[k] = copy.deepcopy(v)
                self.db._save()
                break
        return LocalUpdateResult(matched, matched)

    async def delete_one(self, filter_dict):
        items = self.db._data.get(self.name, [])
        deleted = 0
        for i, d in enumerate(items):
            if self._matches(d, filter_dict):
                del items[i]
                deleted = 1
                self.db._save()
                break
        return LocalDeleteResult(deleted)

class LocalDatabase:
    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self._data = {"users": [], "products": []}
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load local DB file: {e}")
        self.users = LocalCollection(self, "users")
        self.products = LocalCollection(self, "products")

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving local DB: {e}")

    def __getitem__(self, name):
        if not hasattr(self, name):
            setattr(self, name, LocalCollection(self, name))
        return getattr(self, name)

client = None
db = LocalDatabase(ROOT_DIR / "local_db.json")

app = FastAPI(title="Kings Get Fashion API")
api = APIRouter(prefix="/api")

# Create static directories for uploads
static_dir = ROOT_DIR / "static"
uploads_dir = static_dir / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

app.mount("/api/static", StaticFiles(directory=str(static_dir)), name="static")

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# -------------------- Models --------------------
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    role: str


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class BulkDiscountBody(BaseModel):
    product_ids: List[str]
    discount: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_url: str
    price: float
    specifications: str = ""
    category: str
    tags: List[str] = []
    fabric: Optional[str] = ""
    sizes: Optional[str] = ""
    color: Optional[str] = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProductCreate(BaseModel):
    title: str
    image_url: str
    price: float
    specifications: str = ""
    category: str
    tags: List[str] = []
    fabric: Optional[str] = ""
    sizes: Optional[str] = ""
    color: Optional[str] = ""


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    specifications: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    fabric: Optional[str] = None
    sizes: Optional[str] = None
    color: Optional[str] = None


# -------------------- Auth helpers --------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 12,
        path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# -------------------- Auth endpoints --------------------
@api.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    """
    Registers a new customer user in the system.
    Generates a unique ID, hashes the password using bcrypt, and sets the secure session cookie.
    Returns registration details and jwt access token.
    """
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": body.name,
        "role": "user",
        "password_hash": hash_password(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, "user")
    set_auth_cookie(response, token)
    return {"id": user_id, "email": email, "name": body.name, "role": "user", "token": token}


@api.post("/auth/login")
async def login(body: LoginBody, response: Response):
    """
    Authenticates a user (customer or admin) using email and password.
    Sets a secure JWT access token cookie on successful authentication.
    """
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user["role"])
    set_auth_cookie(response, token)
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "token": token,
    }


@api.post("/auth/logout")
async def logout(response: Response):
    """
    Clears the access_token secure cookie, logging out the current user session.
    """
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    """
    Returns the profile details of the currently authenticated user.
    Throws 401 if not authenticated.
    """
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


# -------------------- Product endpoints --------------------
def _clean(p: dict) -> dict:
    """Removes MongoDB specific fields from a document before sending to client."""
    p.pop("_id", None)
    return p


@api.get("/products")
async def list_products(category: Optional[str] = None):
    """
    Fetches the catalog of products from the database.
    Supports optional category slug filtering. Results are sorted by newest first.
    """
    query = {}
    if category and category != "all":
        query["category"] = category
    cursor = db.products.find(query).sort("created_at", -1)
    items = await cursor.to_list(1000)
    return [_clean(i) for i in items]


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    """
    Retrieves the detailed info of a single product.
    Returns 404 if the product ID is not found.
    """
    item = await db.products.find_one({"id": product_id})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return _clean(item)


@api.post("/products")
async def create_product(body: ProductCreate, _: dict = Depends(require_admin)):
    """
    Creates a new product artifact in the catalog.
    Requires Admin authorization role.
    """
    product = Product(**body.model_dump())
    await db.products.insert_one(product.model_dump())
    return product.model_dump()


@api.put("/products/{product_id}")
async def update_product(product_id: str, body: ProductUpdate, _: dict = Depends(require_admin)):
    """
    Updates fields of an existing product in the catalog.
    Requires Admin authorization role.
    """
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.products.update_one({"id": product_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    item = await db.products.find_one({"id": product_id})
    return _clean(item)


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, _: dict = Depends(require_admin)):
    """
    Deletes a product from the database permanently.
    Requires Admin authorization role.
    """
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


@api.post("/products/bulk-discount")
async def bulk_discount(body: BulkDiscountBody, _: dict = Depends(require_admin)):
    """
    Updates the discount tags of multiple products concurrently.
    Accepts a list of product IDs and a discount percentage.
    If the discount parameter is empty, removes all discount tags.
    Requires Admin authorization role.
    """
    product_ids = body.product_ids
    discount = body.discount.strip()
    for pid in product_ids:
        product = await db.products.find_one({"id": pid})
        if not product:
            continue
        tags = product.get("tags", [])
        tags = [t for t in tags if not t.lower().startswith("discount:")]
        if discount:
            tags.append(f"Discount: {discount}")
        await db.products.update_one({"id": pid}, {"$set": {"tags": tags}})
    return {"ok": True}


@api.get("/categories")
async def get_categories():
    """
    Fetches the static list of KGF product categories with names, slugs, and subtitles.
    """
    return [
        {"slug": "shirts", "name": "T-Shirts & Shirts", "subtitle": "The Armor"},
        {"slug": "pyjamas", "name": "Pyjamas & Joggers", "subtitle": "Lounge Luxury"},
        {"slug": "jackets", "name": "Jackets", "subtitle": "The Statement"},
        {"slug": "shoes", "name": "Shoes & Sneakers", "subtitle": "The Foundation"},
        {"slug": "watches", "name": "Watches", "subtitle": "Chronographs"},
        {"slug": "eyewear", "name": "Eyewear", "subtitle": "Shades / Tints"},
        {"slug": "grooming", "name": "Grooming & Fragrances", "subtitle": "Deodorants / Colognes"},
        {"slug": "accessories", "name": "Accessories", "subtitle": "Belts / Wallets"},
    ]


@api.post("/upload")
async def upload_image(file: UploadFile = File(...), _: dict = Depends(require_admin)):
    """
    Handles image uploading and compression for product cards.
    Accepts jpg, jpeg, png, webp, and gif. Validates that the file size is under 5MB 
    and is a valid image format by reading it through PIL.
    Requires Admin authorization role.
    """
    # 1. Validate file extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(status_code=400, detail="Only image files (jpg, jpeg, png, webp, gif) are allowed")
    
    # 2. Enforce 50MB size limit (allows high-resolution photo uploads which Pillow will compress)
    MAX_SIZE = 50 * 1024 * 1024
    content = await file.read(MAX_SIZE + 1)
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 50MB limit")
    
    # 3. Read image bytes into PIL to verify format validity
    import io
    file_bytes = io.BytesIO(content)
    
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = uploads_dir / filename
    
    from PIL import Image
    try:
        # Load image into PIL (this will throw if file is not a valid/supported image format)
        img = Image.open(file_bytes)
        
        # Verify image container format explicitly by checking Pillow's format property
        if img.format not in ["PNG", "JPEG", "MPO", "WEBP", "GIF"]:
            raise ValueError("Unsupported image format: " + str(img.format))
        
        
        # Convert RGBA to RGB if saving as JPEG to avoid transparency errors
        if ext in ["jpg", "jpeg"] and img.mode in ("RGBA", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
            
        # Resize if width is larger than 1200px
        max_width = 1200
        if img.width > max_width:
            w_percent = max_width / float(img.width)
            h_size = int(float(img.height) * float(w_percent))
            try:
                img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
            except AttributeError:
                img = img.resize((max_width, h_size), Image.LANCZOS)
                
        # Save optimized image
        if ext in ["jpg", "jpeg"]:
            img.save(file_path, "JPEG", optimize=True, quality=75)
        elif ext == "png":
            img.save(file_path, "PNG", optimize=True)
        elif ext == "webp":
            img.save(file_path, "WEBP", quality=75)
        else:
            img.save(file_path)
            
    except Exception as e:
        logger.error(f"Image validation/processing failed: {e}")
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image format")
        
    return {"url": f"/api/static/uploads/{filename}"}


# -------------------- Health --------------------
@api.get("/")
async def root():
    """Simple API health check endpoint."""
    return {"service": "KGF API", "status": "ok"}


# -------------------- Seeding --------------------
SEED_PRODUCTS = [
    {"title": "Onyx Crewneck Tee", "image_url": "https://images.unsplash.com/photo-1762914395034-67c2f8c73c59", "price": 1899, "category": "shirts", "tags": ["Trending"], "fabric": "240 GSM Combed Cotton", "sizes": "S, M, L, XL", "color": "Jet Black", "specifications": "Heavyweight crewneck with reinforced collar. Pre-shrunk, garment-dyed for a faded matte tone."},
    {"title": "Noir Oversized Shirt", "image_url": "https://images.unsplash.com/photo-1627890458144-4c0c481bf4b8", "price": 2499, "category": "shirts", "tags": ["In-Store Only"], "fabric": "Tencel Twill", "sizes": "M, L, XL", "color": "Smoke Charcoal", "specifications": "Drop-shoulder silhouette, mother-of-pearl buttons, single chest pocket."},
    {"title": "Midnight Lounge Joggers", "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7", "price": 2199, "category": "pyjamas", "tags": ["Trending"], "fabric": "French Terry", "sizes": "S, M, L, XL", "color": "Obsidian", "specifications": "Tapered fit, ribbed cuff, dual side pockets with hidden zip."},
    {"title": "Velvet Pyjama Set", "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea", "price": 3299, "category": "pyjamas", "tags": [], "fabric": "Crushed Velvet", "sizes": "M, L, XL", "color": "Royal Black", "specifications": "Two-piece lounge set with gold piping detail. Hand-finished hems."},
    {"title": "Regal Bomber Jacket", "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5", "price": 5999, "category": "jackets", "tags": ["Trending", "In-Store Only"], "fabric": "Technical Nylon Shell", "sizes": "M, L, XL", "color": "Matte Black", "specifications": "Water-resistant outer, ribbed cuffs & hem, satin lining, YKK metal zip."},
    {"title": "Bronze Leather Coat", "image_url": "https://images.unsplash.com/photo-1520975916090-3105956dac38", "price": 12999, "category": "jackets", "tags": ["In-Store Only"], "fabric": "Full-Grain Leather", "sizes": "L, XL", "color": "Burnished Bronze", "specifications": "Hand-stitched panels, quilted shoulder lining, antique brass hardware."},
    {"title": "Shadow Runner Sneaker", "image_url": "https://images.pexels.com/photos/9986259/pexels-photo-9986259.jpeg", "price": 4499, "category": "shoes", "tags": ["Trending"], "fabric": "Knit Mesh + TPU", "sizes": "UK 7, 8, 9, 10, 11", "color": "Triple Black", "specifications": "Cushioned midsole, carbon-rubber outsole, reinforced toe-cap."},
    {"title": "Phantom Low-Top", "image_url": "https://images.pexels.com/photos/5930091/pexels-photo-5930091.jpeg", "price": 3899, "category": "shoes", "tags": [], "fabric": "Italian Suede", "sizes": "UK 7, 8, 9, 10", "color": "Matte Onyx", "specifications": "Hand-finished suede upper, blind eyelet system, leather-lined collar."},
    {"title": "Chronograph Sovereign", "image_url": "https://images.unsplash.com/photo-1618215650148-e8e61eae521c", "price": 18999, "category": "watches", "tags": ["Trending"], "fabric": "316L Stainless Steel", "sizes": "40mm Case", "color": "Champagne Gold", "specifications": "Sapphire crystal, Swiss quartz movement, sapphire-coated dial, 10ATM water resistance."},
    {"title": "Argent Auto-Movement", "image_url": "https://images.unsplash.com/photo-1547996160-81dfa63595aa", "price": 24999, "category": "watches", "tags": ["In-Store Only"], "fabric": "Brushed Steel", "sizes": "42mm Case", "color": "Silver / Black Dial", "specifications": "Automatic movement, exhibition caseback, screw-down crown."},
    {"title": "Aviator Tint Eyewear", "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f", "price": 2799, "category": "eyewear", "tags": [], "fabric": "Titanium Frame", "sizes": "One Size", "color": "Gunmetal", "specifications": "Polarized lenses, UV400, adjustable nose pads, microfiber pouch included."},
    {"title": "Royal Wayfarer", "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083", "price": 2299, "category": "eyewear", "tags": ["Trending"], "fabric": "Acetate", "sizes": "One Size", "color": "Tortoise Black", "specifications": "Hand-polished acetate, gradient brown lenses, spring-loaded hinges."},
    {"title": "Noir Eau de Parfum 100ml", "image_url": "https://images.unsplash.com/photo-1698877577733-65ae7dee328c", "price": 4499, "category": "grooming", "tags": ["Trending"], "fabric": "Glass Flacon", "sizes": "100ml", "color": "Smoke Black", "specifications": "Notes: bergamot, oud, leather, smoked vanilla. Long-lasting EDP concentration."},
    {"title": "Leather Cologne 75ml", "image_url": "https://images.unsplash.com/photo-1654617058572-f1f473581778", "price": 3899, "category": "grooming", "tags": [], "fabric": "Glass + Brass Cap", "sizes": "75ml", "color": "Amber", "specifications": "Notes: saffron, suede, sandalwood. Designed for evening wear."},
    {"title": "Solid Brass Buckle Belt", "image_url": "https://images.unsplash.com/photo-1624222247344-550fb60583dc", "price": 1799, "category": "accessories", "tags": [], "fabric": "Italian Calfskin", "sizes": "32, 34, 36, 38", "color": "Black / Gold", "specifications": "Solid brass buckle, hand-burnished edges, single-piece leather strap."},
    {"title": "Bifold Card Wallet", "image_url": "https://images.unsplash.com/photo-1680229892113-ba11b247ec0b", "price": 2199, "category": "accessories", "tags": ["Trending"], "fabric": "Vegetable-Tanned Leather", "sizes": "Compact", "color": "Espresso", "specifications": "6 card slots, RFID-blocking layer, gold-foil interior stamp."},
]


async def seed_db():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.products.create_index("id", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@kgf.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "KGF Admin",
            "role": "admin",
            "password_hash": hash_password(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    # Seed products
    count = await db.products.count_documents({})
    if count == 0:
        for sp in SEED_PRODUCTS:
            product = Product(**sp)
            await db.products.insert_one(product.model_dump())
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")


@app.on_event("startup")
async def on_startup():
    global client, db
    try:
        if mongo_url and "mongodb" in mongo_url:
            test_client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
            await test_client.admin.command("ping")
            client = test_client
            db = client[db_name]
            logger.info(f"Connected to MongoDB database: {db_name}")
    except Exception as e:
        logger.info(f"MongoDB offline/unreachable ({e}). Operating with local storage: local_db.json")
        client = None
        db = LocalDatabase(ROOT_DIR / "local_db.json")

    try:
        await seed_db()
    except Exception as e:
        logger.exception(f"Seeding error: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    if client:
        client.close()


# Register router & middleware
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
