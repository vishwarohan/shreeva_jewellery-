# WYW — Way You Want | Full Stack App

India's premier Hip Hop Jewellery brand — complete e-commerce platform built with **React.js**, **Node.js + Express**, and **MongoDB**.

---

## 🗂 Project Structure

```
wyw/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── Product.js        # Product schema (types, ratings, reviews)
│   │   ├── User.js           # User schema (JWT auth, cart, wishlist)
│   │   ├── Order.js          # Order schema (items, shipping, tracking)
│   │   └── CustomOrder.js    # Custom jewellery requests
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   └── customOrderController.js
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/register|login, GET /api/auth/me
│   │   ├── products.js       # CRUD /api/products + reviews
│   │   ├── orders.js         # /api/orders (create, list, status update)
│   │   ├── cart.js           # /api/cart + wishlist
│   │   └── custom.js         # /api/custom (quote requests)
│   ├── middleware/
│   │   └── auth.js           # JWT protect + adminOnly
│   ├── server.js             # Express app + MongoDB connect
│   ├── seed.js               # DB seed with sample products + admin
│   ├── .env.example
│   └── package.json
│
└── frontend/                 # React.js SPA
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.js  # Login, register, logout, user state
    │   │   └── CartContext.js  # Cart CRUD, wishlist, totals
    │   ├── utils/
    │   │   └── api.js          # Axios instance with JWT interceptors
    │   ├── components/
    │   │   ├── Navbar.js       # Fixed nav, cart badge, user dropdown
    │   │   ├── Footer.js       # Links, social, address
    │   │   └── ProductCard.js  # Product grid card with SVG icons
    │   ├── pages/
    │   │   ├── HomePage.js     # Hero, ticker, featured, about strip
    │   │   ├── ShopPage.js     # Filter/sort/search + pagination
    │   │   ├── ProductDetailPage.js  # Detail view + reviews
    │   │   ├── CartPage.js     # Cart + checkout + order placement
    │   │   ├── AuthPage.js     # Login + Register
    │   │   ├── CustomPage.js   # Custom quote form
    │   │   ├── OrdersPage.js   # Order history + order detail + tracker
    │   │   └── AdminPage.js    # Dashboard, product CRUD, order mgmt
    │   ├── App.js              # Router with all routes
    │   └── index.css           # Global design system tokens
    └── package.json
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
cp .env.example .env        # Fill in your MongoDB URI + JWT secret
npm install
npm run seed                # Seed 8 products + admin user
npm run dev                 # Start on http://localhost:5000
```

**Admin credentials after seed:**
- Email: `admin@thewyw.com`
- Password: `Admin@123`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start                   # Start on http://localhost:3000
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/me` | Update profile (protected) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List with filters: `?type=Chain&sort=popular&page=1&limit=12&featured=true&search=q` |
| GET | `/api/products/:id` | Single product by ID or slug |
| POST | `/api/products` | Create (admin) |
| PUT | `/api/products/:id` | Update (admin) |
| DELETE | `/api/products/:id` | Deactivate (admin) |
| POST | `/api/products/:id/reviews` | Add review (user) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart` | Add item `{ productId, quantity, size }` |
| PUT | `/api/cart/:itemId` | Update quantity |
| DELETE | `/api/cart/:itemId` | Remove item |
| POST | `/api/cart/wishlist/:productId` | Toggle wishlist |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders/my` | My orders |
| GET | `/api/orders/:id` | Single order |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update status (admin) |

### Custom Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/custom` | Submit quote request (public) |
| GET | `/api/custom` | All custom orders (admin) |
| PUT | `/api/custom/:id` | Update status + quote (admin) |

---

## ⚙️ Features

### Customer Features
- 🛍️ Browse products with filter by type, sort, search, pagination
- 📦 Product detail with size selector, quantity, reviews
- 🛒 Live cart with quantity controls, shipping calc
- 💳 Checkout with shipping address + payment method selection
- 📬 Order history with status tracker (Processing → Confirmed → Shipped → Delivered)
- 💎 Custom jewellery quote request form
- ⭐ Leave product reviews with star rating
- ❤️ Wishlist toggle

### Admin Features (`/admin`)
- 📊 Dashboard with revenue, order count, product count stats
- ➕ Create / edit / deactivate products
- 📋 View and update order statuses
- ✂️ Manage custom order requests with status pipeline

### Tech
- **JWT** auth stored in localStorage, auto-attached via Axios interceptor
- **MongoDB** with Mongoose schemas, virtuals, pre-save hooks
- **React Context** for auth + cart global state
- **react-hot-toast** for notifications
- **react-router-dom v6** with nested routes
- Gold `#C9A84C` + near-black design system with Bebas Neue + Barlow fonts

---

## 🌍 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wyw_jewellery
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
