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

Follow these simple steps to run the complete project locally.

### Step 1: Prerequisites
Ensure you have the following installed on your machine:
1. **Node.js (v18 or higher)**: Download and install the LTS version from [nodejs.org](https://nodejs.org/).
2. **Python (v3.10 or higher)**: Download from [python.org](https://www.python.org/downloads/).  
   *(⚠️ **Crucial on Windows**: Check the box **"Add python.exe to PATH"** during installation).*

---

### Step 2: Backend Setup & Launch

1. Open your terminal (**PowerShell** or **Command Prompt**) and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI backend server:
   ```bash
   python -m uvicorn server:app --reload --port 8000
   ```
   * The backend will start on **`http://localhost:8000`**.
   * Interactive Swagger documentation is accessible at **`http://localhost:8000/docs`**.

---

### Step 3: Frontend Setup & Launch

1. Open a **second terminal window** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * The frontend will start on **`http://localhost:5173`**.

---

### Step 4: Open in Browser

Open your web browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

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
