# 🛒 ecommerce-backend-platform

A scalable and modular backend for a full-featured e-commerce platform, built using **Node.js**, **Express.js**, and **MongoDB**. This RESTful API handles everything from user authentication to cart management, orders, payments, wishlist, and testimonials.

---

## 🚀 Features

- 🔐 User registration & login (with OTP support)
- 🛍️ Product and featured listings
- 🛒 Cart and wishlist management
- 💳 Payment integration (Razorpay & direct)
- 🧾 Order creation and history
- 📮 Contact form and user testimonials
- ✅ Secure route protection using JWT

---

## 📦 Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** Authentication
- **Razorpay** API for payments
- **Dotenv** for environment configs

---

## 📁 Folder Structure

```
├── controllers/         # Request handlers (auth, cart, wishlist, etc.)
├── middleware/          # JWT auth middleware
├── models/              # Mongoose schemas
├── routes/              # API routes
├── utils/               # Helper functions (OTP, email, etc.)
├── .env                 # Environment variables
├── server.js            # App entry point
```

---

## 🧪 API Overview

### Auth
- `POST /api/auth/initiate-registration`
- `POST /api/auth/complete-registration`
- `POST /api/auth/login`
- `POST /api/auth/password/forgot`
- `POST /api/auth/password/reset`

### Products
- `GET /api/products/`
- `GET /api/products/:id`
- `GET /api/products/:type/:id/related`
- `GET /api/products/category/:slug`

### Cart
- `GET /api/cart/:userId`
- `POST /api/cart/:userId`
- `PUT /api/cart/:userId/:productId/quantity`
- `DELETE /api/cart/:userId/:productId`

### Wishlist
- `GET /api/wishlist/:userId`
- `POST /api/wishlist/:userId`
- `DELETE /api/wishlist/:userId/:itemId/:itemType`

### Orders
- `POST /api/order/create-order`
- `POST /api/order/verify-payment`
- `GET /api/order/:userId/history`

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/michael-clinton/ecom-backend-platform.git
cd ecommerce-backend-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 4. Start the server

```bash
npm run dev
```

Server will run on `http://localhost:5000/`

---

## 🧠 Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License

This project is licensed under the MIT License.
