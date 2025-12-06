import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";

import Root from "./Components/Root/Root.jsx";
import About from "./Components/About/About.jsx";
import Contact from "./Components/Contact/Contact.jsx";
import Products from "./Components/Products/Products.jsx";
import Productfromapi from "./Components/Productfromapi/Productfromapi.jsx";
import Details from "./Components/Details/Details.jsx";
import Order from './Components/Order/Order.jsx';
import Login from './Components/Login/Login.jsx';
import Dashboard from './Components/Dashboard/Dashboard.jsx';
import Register from './Components/Register/Register.jsx';
import EditProfile from './Components/EditProfile/EditProfile.jsx';
import AdminOrders from './Components/Admin/AdminOrders.jsx';
import CreateProduct from './Components/Admin/CreateProduct.jsx'; // Import CreateProduct
import AdminProducts from './Components/Admin/AdminProducts.jsx'; // NEW: Import AdminProducts
import EditProduct from './Components/Admin/EditProduct.jsx'; // NEW: Import EditProduct
import AdminUsers from './Components/Admin/AdminUsers.jsx'; // NEW: Import AdminUsers
import Wishlist from './Components/Wishlist/Wishlist.jsx'; // Import Wishlist
import CartPage from './Components/CartPage/CartPage.jsx'; // NEW: Import CartPage
import CheckoutPage from './Components/CheckoutPage/CheckoutPage.jsx'; // NEW: Import CheckoutPage
import { AuthProvider } from './Components/AuthContext/AuthContext.jsx'; // Correct import for AuthProvider
import { CartProvider } from './Components/CartContext/CartContext.jsx'; // NEW: Import CartProvider
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx'; // Import ProtectedRoute

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/contact",
    Component: Contact,
  },
  {
    path: "/products",
    loader: async ({ request }) => { // Access request object to get URL search params
      const url = new URL(request.url);
      const search = url.searchParams.get('search');
      const category = url.searchParams.get('category');

      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (category && category !== 'All') query.append('category', category);

      const response = await fetch(`http://localhost:5000/api/products?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products from loader.');
      }
      return response.json();
    },
    Component: Products,
  },
  {
    path: "/productfromapi",
    loader: () => fetch("https://fakestoreapi.com/products/"), // Keep this for now if it's a separate feature
    Component: Productfromapi,
  },
  {
    path: "/products/:id",
    loader: ({ params }) => {
      return fetch(`http://localhost:5000/api/products/${params.id}`); // Use new backend API
    },
    Component: Details,
  },

  {
    path: "/products/order/:id",
    loader: ({ params }) => {
      return fetch(`http://localhost:5000/api/products/${params.id}`); // Use new backend API
    },
    element: <ProtectedRoute><Order /></ProtectedRoute>, // Protect the Order route
  },
  {
    path: "/Login",
    Component: Login,
  },
  {
    path: "/Dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>, // Protect the Dashboard route
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/editprofile",
    element: <ProtectedRoute><EditProfile /></ProtectedRoute>, // Protect the EditProfile route
  },
  {
    path:"/admin/orders",
    element: <ProtectedRoute><AdminOrders /></ProtectedRoute>, // Protect the AdminOrders route
  },
  {
    path:"/admin/products/create", // New route for creating products
    element: <ProtectedRoute><CreateProduct /></ProtectedRoute>, // Protect the CreateProduct route
  },
  {
    path:"/admin/products", // NEW: Route for AdminProducts
    element: <ProtectedRoute><AdminProducts /></ProtectedRoute>, // Protect the AdminProducts route
  },
  {
    path:"/admin/products/edit/:id", // NEW: Route for EditProduct
    element: <ProtectedRoute><EditProduct /></ProtectedRoute>, // Protect the EditProduct route
  },
  {
    path:"/admin/users", // NEW: Route for AdminUsers
    element: <ProtectedRoute><AdminUsers /></ProtectedRoute>, // Protect the AdminUsers route
  },
  {
    path: "/wishlist", // New route for wishlist
    element: <ProtectedRoute><Wishlist /></ProtectedRoute>, // Protect the Wishlist route
  },
  {
    path: "/cart", // NEW: Route for the Cart page
    element: <ProtectedRoute><CartPage /></ProtectedRoute>, // Protect the Cart page
  },
  {
    path: "/checkout", // NEW: Route for the Checkout page
    element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>, // Protect the Checkout page
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider> {/* NEW: Wrap with CartProvider */}
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);