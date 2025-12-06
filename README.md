# Tumar Dukan - E-commerce Application

## Project Overview

Tumar Dukan is a full-stack e-commerce application designed to provide a seamless shopping experience. It features robust user authentication, product browsing, a shopping cart, wishlist functionality, order management, and an administrative panel for managing products and users.

## Features

*   **User Authentication**: Secure user registration, login, and profile management using Firebase Authentication (email/password, Google, GitHub).
*   **Product Catalog**: Browse a wide range of products with search and category filtering.
*   **Product Details**: View detailed product information, including descriptions, pricing, and images.
*   **Shopping Cart**: Add, update, and remove items from a persistent shopping cart.
*   **Wishlist**: Save favorite products for later.
*   **Order Placement**: Secure checkout process with various payment methods (Cash on Delivery, bKash, Nagad).
*   **User Dashboard**: View personal order history and manage profile details.
*   **Admin Panel**:
    *   Manage all customer orders (view, update status).
    *   Manage products (create, edit, delete).
    *   Manage users (view, update roles, block/unblock).
*   **Responsive Design**: Optimized for various screen sizes using Tailwind CSS.

## Tech Stack

### Frontend
*   **React**: JavaScript library for building user interfaces.
*   **Vite**: Fast build tool for modern web projects.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **React Router DOM**: For client-side routing and navigation.
*   **Firebase Client SDK**: For client-side authentication (Auth).
*   **Lucide React**: Icon library.
*   **shadcn/ui**: Re-usable UI components.

### Backend
*   **Node.js & Express**: Backend runtime and web framework.
*   **MongoDB & Mongoose**: NoSQL database and ODM for data storage.
*   **Firebase Admin SDK**: For backend verification of Firebase ID tokens.
*   **CORS**: Middleware for handling Cross-Origin Resource Sharing.
*   **dotenv**: For managing environment variables.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (v20 or higher recommended)
*   npm or Yarn
*   MongoDB (local instance or cloud service like MongoDB Atlas)
*   Firebase Project (with Authentication enabled for Email/Password, Google, and GitHub)

### 1. Backend Setup

The backend handles API requests, database interactions, and Firebase ID token verification.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Create a `.env` file:**
    In the `backend` directory, create a file named `.env` and add the following variables:
    ```env
    MONGO_URI=your_mongodb_connection_string
    PORT=5000
    # JWT_SECRET=your_jwt_secret_key_for_legacy_auth (not actively used for Firebase auth, but good to keep if other JWTs are used)
    ```
    Replace `your_mongodb_connection_string` with your MongoDB connection URI.

4.  **Firebase Admin SDK Configuration:**
    *   Go to your Firebase project console.
    *   Navigate to "Project settings" > "Service accounts".
    *   Click "Generate new private key" and download the JSON file.
    *   Rename the downloaded file to `serviceAccountKey.json` and place it directly inside the `backend` directory. **Keep this file secure and do not commit it to public repositories.**

5.  **Run the backend server:**
    ```bash
    npm run dev
    # or npm start (for production-like run)
    ```
    The backend server will start on `http://localhost:5000` (or your specified PORT). It will also attempt to seed initial product data from `products.json` if the database is empty.

### 2. Frontend Setup

The frontend is a React application built with Vite.

1.  **Navigate back to the project root directory:**
    ```bash
    cd ..
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Firebase Client SDK Configuration:**
    The Firebase client configuration is located in `src/Components/firebase/firebase.int.js`. Ensure the `firebaseConfig` object contains your actual Firebase project credentials.
    ```javascript
    // src/Components/firebase/firebase.int.js
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
    };
    ```
    Replace the placeholder values with your Firebase project's configuration.

4.  **Run the frontend application:**
    ```bash
    npm run dev
    # or yarn dev
    ```
    The frontend application will typically open in your browser at `http://localhost:5173`.

## Important Notes

*   **CORS**: The backend is configured to allow requests from `http://localhost:5173`. If your frontend runs on a different port or domain, update the `cors` origin in `backend/server.js`.
*   **Product Seeding**: The backend automatically seeds products from `backend/products.json` into MongoDB if the `products` collection is empty. This is a one-time operation on first run.
*   **Admin Access**: To grant a user admin privileges, an administrator can update their role via the Admin Users panel. Initially, you might need to manually update a user's `role` field in MongoDB to 'admin' for the first admin account.

## API Endpoints (Backend)

*   `GET /api/products`: Get all products (with optional `category` and `search` query params).
*   `GET /api/products/:id`: Get a single product by ID.
*   `POST /api/products`: Create a new product (Admin only).
*   `PUT /api/products/:id`: Update a product (Admin only).
*   `DELETE /api/products/:id`: Delete a product (Admin only).
*   `POST /api/users`: Create or update user profile in MongoDB after Firebase auth.
*   `PUT /api/users/:uid`: Update specific user fields (Authenticated user or Admin).
*   `GET /api/users/:uid`: Get user profile by UID (Authenticated user or Admin).
*   `GET /api/users`: Get all user profiles (Admin only).
*   `PUT /api/users/:uid/status`: Update user status (Admin only).
*   `PUT /api/users/:uid/role`: Update user role (Admin only).
*   `POST /api/orders`: Place a new order (Authenticated user).
*   `GET /api/orders/user/:uid`: Get all orders for a specific user (Authenticated user or Admin).
*   `GET /api/orders`: Get all orders (Admin only).
*   `PUT /api/orders/:id/status`: Update the status of an order (Admin only).
*   `POST /api/wishlist`: Add a product to the user's wishlist (Authenticated user).
*   `DELETE /api/wishlist/:productId`: Remove a product from the user's wishlist (Authenticated user).
*   `GET /api/wishlist/user/:uid`: Get all wishlist items for a specific user (Authenticated user or Admin).
*   `GET /api/wishlist/status/:productId`: Check if a product is in the user's wishlist (Authenticated user).
*   `GET /api/cart`: Get user's cart (Authenticated user).
*   `POST /api/cart`: Add item to cart or update quantity (Authenticated user).
*   `PUT /api/cart/:productId`: Update quantity of an item in cart (Authenticated user).
*   `DELETE /api/cart/:productId`: Remove item from cart (Authenticated user).
*   `DELETE /api/cart/clear`: Clear user's cart (Authenticated user).
*   `POST /api/reviews`: Add a new review for a product (Authenticated user).
*   `GET /api/reviews/product/:productId`: Get all reviews for a specific product (Public).
*   `POST /api/reviews/:reviewId/reply`: Add a reply to an existing review (Authenticated user).

## Available Scripts

### Frontend (from project root)
*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the project for production.
*   `npm run lint`: Lints the project files.
*   `npm run preview`: Serves the production build locally.

### Backend (from `backend` directory)
*   `npm start`: Starts the backend server (production mode).
*   `npm run dev`: Starts the backend server with `nodemon` for auto-restarts during development.
*   `npm run shell`: Opens a Firebase functions shell (if configured).
*   `npm run deploy`: Deploys Firebase functions (if configured).
*   `npm run logs`: Views Firebase functions logs (if configured).