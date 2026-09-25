# 👑 KGF — Kings Get Fashion
> **A Sovereign Menswear Realm & Digital Inventory Management System**

An end-to-end, high-performance web platform designed for luxury menswear retail. KGF combines a customer-facing digital catalog with an admin inventory control dashboard featuring real-time search, dynamic discount price calculations with visual strikethrough styling, image upload & compression, and offline-first database resilience.

---

## 📖 Table of Contents
1. [What is Our Product?](#1-what-is-our-product)
   - [Core Customer Experience](#core-customer-experience)
   - [Sovereign Admin Dashboard](#sovereign-admin-dashboard)
   - [Security & Architecture Highlights](#security--architecture-highlights)
2. [Technologies Used](#2-technologies-used)
   - [Frontend Stack](#frontend-stack)
   - [Backend Stack](#backend-stack)
   - [Database & Storage](#database--storage)
3. [How to Run This Project on Your Computer](#3-how-to-run-this-project-on-your-computer)
   - [Step 1: Prerequisites](#step-1-prerequisites)
   - [Step 2: Backend Setup & Launch](#step-2-backend-setup--launch)
   - [Step 3: Frontend Setup & Launch](#step-3-frontend-setup--launch)
   - [Step 4: Open in Browser](#step-4-open-in-browser)
4. [Default Credentials & Testing](#4-default-credentials--testing)
5. [Project Directory Structure](#5-project-directory-structure)

---

## 1. What is Our Product?

**KGF (Kings Get Fashion)** is an online digital catalog and store management solution crafted for an exclusive menswear and lifestyle brand. It bridges the physical retail store experience with modern web capabilities:

### Core Customer Experience
* **Typographic Brand Reveal**: An animated landing experience powered by Framer Motion that transitions dynamically from the acronym `KGF` into the full banner `Kings Get Fashion`.
* **Category Pillars & Real-Time Filtering**: Instant categorization across *Shirts & Tees*, *Pyjamas & Joggers*, *Jackets*, *Shoes & Sneakers*, *Chronographs (Watches)*, *Eyewear*, *Grooming & Fragrances*, and *Accessories*.
* **Live Search**: Multi-field instant searching across product title, color palette, fabric, and specifications.
* **Dynamic Discount Calculation & Strikethrough Pricing**: Whenever a discount is active, the original price is displayed with a clean strikethrough cut-line (`₹2,499`) alongside the newly calculated final price (`₹1,999`) highlighted in royal gold typography, accompanied by a discount badge (`20% OFF`).
* **Interactive Product Detail Drawer**: Clicking any product opens a sliding sheet showing high-resolution imagery, fabric details, size options, color, detailed craftsmanship notes, and the physical storefront address (`+91 xxxxx xxxxx`).

### Sovereign Admin Dashboard
* **Full Inventory Management**: Real-time table view of all products with instant search and category filtering.
* **Add, Edit & Delete**: Modal form for creating and updating products with custom tags, fabrics, and pricing.
* **Single & Bulk Discount Engine**: Select multiple products via checkboxes and apply or clear discounts (e.g., `20%`, `30%`) in a single click.
* **Image Upload & Optimization**: Upload product photos directly from the admin panel with automatic server-side format verification, resizing, and Pillow compression to save bandwidth.

### Security & Architecture Highlights
* **Zero Plain-Text Passwords**: All user and admin passwords are encrypted using one-way cryptographic **Bcrypt** hashing.
* **Secure JWT Sessions**: 12-hour session duration using HttpOnly cookies with `Authorization: Bearer` token fallback.
* **Offline-First Resilience**: If a remote cloud database (like MongoDB Atlas) is temporarily offline or unconfigured, the backend automatically falls back to local JSON persistence (`local_db.json`), ensuring the application never crashes during offline demonstrations.

---

## 2. Technologies Used

### Frontend Stack
| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component-driven UI architecture |
| **Vite 5** | Ultra-fast development server and production build bundler |
| **Tailwind CSS 3** | Utility-first responsive styling and custom luxury gold themes |
| **Framer Motion** | Smooth animations, hero brand reveal, and layout transitions |
| **Radix UI** | Accessible UI primitives (`@radix-ui/react-dialog` for slide-over drawer) |
| **Lucide React** | Minimalist icon set |
| **Sonner** | Modern toast notification system |
| **Axios** | HTTP client for REST API communication with automatic JWT interceptors |
| **React Router DOM v6** | Client-side routing with role-based `ProtectedRoute` guards |

### Backend Stack
| Technology | Purpose |
| :--- | :--- |
| **Python 3.10+ / 3.14** | High-level backend programming language |
| **FastAPI** | High-performance, async Python web framework for REST APIs |
| **Uvicorn** | Lightning-fast ASGI web server |
| **Pydantic v2** | Data validation and settings management using Python type hints |
| **Bcrypt** | Industry-standard salted password hashing |
| **PyJWT** | JSON Web Token encoding and decoding for user authentication |
| **Pillow (PIL)** | Image processing, container validation, and Lanczos compression |
| **Python-Multipart** | Streaming multipart form parser for image file uploads |
| **Python-Dotenv** | Environment variable management (`.env`) |

### Database & Storage
* **MongoDB / Motor**: Asynchronous MongoDB driver for cloud/production database operations.
* **Local JSON Database Fallback**: Pure Python standard library (`json`, `pathlib`, `copy`) fallback engine ensuring 100% offline functionality out-of-the-box.

---

## 3. How to Run This Project on Your Computer

Follow these complete, step-by-step instructions to clone, configure, and launch the project on your machine.

---

### Step 1: Clone the Repository
Open your terminal (**PowerShell**, **Command Prompt**, or **Bash**) and run:
```bash
git clone https://github.com/0073212/KGF-Realm.git
cd KGF-Realm
```

> **💡 How to Pull the Latest Updates (for existing users):**  
> If you already have the repository cloned on your machine and want to fetch the newest changes, run:
> ```bash
> git pull origin main
> ```

---

### Step 2: Prerequisites
Make sure you have both **Node.js** and **Python** installed:
1. **Node.js (v18 or higher)**: Download and install the LTS version from [nodejs.org](https://nodejs.org/).
2. **Python (v3.10 or higher)**: Download from [python.org](https://www.python.org/downloads/).  
   *(⚠️ **Windows Users**: Ensure you tick **"Add python.exe to PATH"** on the first installer screen).*

---

### Step 3: Configure Environment Variables
Copy the template configuration into a new `.env` file in the `backend/` folder:

* **On Windows (PowerShell / CMD)**:
  ```powershell
  copy backend\.env.example backend\.env
  ```
* **On macOS / Linux**:
  ```bash
  cp backend/.env.example backend/.env
  ```

*(Note: Out-of-the-box, the app is preconfigured to run immediately using the built-in local JSON database — no external MongoDB setup is required to test!)*

---

### Step 4: Backend Setup & Launch

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. *(Optional but recommended)* Create and activate a virtual environment:
   * **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI backend server:
   ```bash
   python -m uvicorn server:app --reload --port 8000
   ```
   * Backend will be live at: **`http://localhost:8000`**
   * Interactive API docs (Swagger): **`http://localhost:8000/docs`**

---

### Step 5: Frontend Setup & Launch

1. Open a **second terminal window** and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Frontend will be live at: **`http://localhost:5173`**

---

### ⚡ Alternative: One-Command Runner (Root Directory)
If you prefer starting both servers together, install root dependencies and run:
```bash
npm install
npm run dev
```
*(This starts both frontend and backend concurrently in a single terminal).*

---

### Step 6: Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)** in your browser to experience the KGF Realm!

---

## 4. Default Credentials & Testing

The system automatically initializes an admin account and 16 starter products on first boot:

### 👑 Admin Account
* **Email**: `admin@kgf.com`
* **Password**: `admin_123`
* **Role**: Admin
* **Features Available**: Access the **Admin** dashboard via the top navigation bar to create/edit products, upload images, and apply/remove bulk discounts.

### 👤 Regular Customer Account
* Visit **`http://localhost:5173/auth`** and switch to the **Register** tab.
* Enter any name, email, and password (minimum 6 characters) to create a customer account and explore the catalog.

### 🏷️ Testing Discount Strikethrough Pricing
1. Log in with the **Admin** account and go to **`http://localhost:5173/admin`**.
2. Select one or more products using the checkboxes on the left.
3. In the gold Bulk Action bar, enter a discount (e.g. `20%` or `30%`) and click **Apply**.
4. Go to **`http://localhost:5173/catalog`** — you will immediately see the original price crossed out with a cut-line (`₹2,499`) and the new discounted price displayed in gold (`₹1,999`).

---

## 5. Project Directory Structure

```text
KGF2/
├── README.md                      # Comprehensive project documentation
├── package.json                   # Root package script runner
│
├── backend/                       # Python FastAPI Backend
│   ├── .env                       # Environment configuration (secrets & URLs)
│   ├── requirements.txt           # Python package dependencies
│   ├── server.py                  # Main API server, endpoints & DB logic
│   ├── local_db.json              # Offline fallback database storage
│   └── static/                    # Static asset storage
│       └── uploads/               # Uploaded & compressed product images
│
└── frontend/                      # React 18 + Vite Frontend
    ├── index.html                 # Main HTML entry point
    ├── vite.config.js             # Vite configuration & /api proxy
    ├── tailwind.config.js         # Tailwind configuration & theme tokens
    ├── package.json               # Node.js dependencies & scripts
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Route definitions & top-level layout
        ├── index.css              # Global styles, fonts & luxury tokens
        ├── components/            # Reusable UI components
        │   ├── Navbar.jsx         # Sticky brand header & auth buttons
        │   ├── Footer.jsx         # Hallmark footer
        │   ├── ProductCard.jsx    # Catalog card with strikethrough discount pricing
        │   ├── ProductDetailSheet.jsx # Product specifications & store drawer
        │   ├── ProtectedRoute.jsx # Role-based route guard
        │   └── ui/                # Accessible Radix primitives & Sonner toast
        ├── context/
        │   └── AuthContext.jsx    # Global authentication provider (JWT state)
        ├── lib/
        │   ├── api.js             # Axios instance & error formatter
        │   └── utils.js           # Discount calculation & image optimizer
        └── pages/
            ├── Landing.jsx        # Typographic hero reveal landing page
            ├── Catalog.jsx        # Product grid with search & category filters
            ├── Admin.jsx          # Inventory control table & bulk actions
            └── AuthPage.jsx       # Login & registration authentication tabs
```

---

## 📄 License
This project is proprietary and built for **KGF — Kings Get Fashion**. All rights reserved.
