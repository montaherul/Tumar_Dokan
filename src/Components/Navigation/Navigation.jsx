import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook
import { Heart, ShoppingCart } from 'lucide-react'; // Import Heart and ShoppingCart icons
import { useCart } from "../CartContext/CartContext"; // NEW: Import useCart hook

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, firebaseUser, logout } = useAuth(); // Get user, firebaseUser and logout from AuthContext
  const { cartTotalItems } = useCart(); // NEW: Get cartTotalItems from CartContext
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0); // State to hold wishlist count

  const API_BASE_URL = "http://localhost:5000/api";

  // Effect to fetch wishlist count when user logs in or changes
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (user && firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`${API_BASE_URL}/wishlist/user/${user.uid}`, {
            headers: {
              'x-auth-token': token,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setWishlistCount(data.length);
          } else {
            console.error("Failed to fetch wishlist count:", data.message);
            setWishlistCount(0);
          }
        } catch (error) {
          console.error("Error fetching wishlist count:", error);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0); // Reset count if no user
      }
    };

    fetchWishlistCount();
    // Re-fetch if user or firebaseUser changes
  }, [user, firebaseUser]);

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    setIsOpen(false); // Close mobile menu if open
    navigate('/login'); // Navigate after logout
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/products", label: "Products" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-semibold px-3 py-2 rounded-md text-sm transition-colors"
      : "text-foreground hover:text-primary hover:bg-secondary font-medium px-3 py-2 rounded-md text-sm transition-colors";

  return (
    <nav className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">
                 Tumar Dukan
              </span>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={getLinkClass}>
                {link.label}
              </NavLink>
            ))}

            {/* If user logged in → show Logout and Wishlist */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Wishlist Icon */}
                <NavLink to="/wishlist" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
                  <Heart className="w-5 h-5 text-foreground" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </NavLink>

                {/* Cart Icon */}
                <NavLink to="/cart" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
                  <ShoppingCart className="w-5 h-5 text-foreground" />
                  {cartTotalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartTotalItems}
                    </span>
                  )}
                </NavLink>

                {/* Profile picture or initial */}
                <NavLink to="/dashboard">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      className="w-8 h-8 rounded-full border border-border object-cover"
                      referrerPolicy="no-referrer"
                      alt="User Avatar"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </NavLink>
                

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink to="/login">
                <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-sky-700 transition">
                  Sign In
                </button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-foreground hover:bg-secondary"
            >
              {!isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-3 space-y-1"> {/* Increased horizontal padding */}
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Wishlist Link */}
            {user && (
              <NavLink
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Wishlist {wishlistCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{wishlistCount}</span>}
              </NavLink>
            )}

            {/* Mobile Cart Link */}
            {user && (
              <NavLink
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart {cartTotalItems > 0 && <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartTotalItems}</span>}
              </NavLink>
            )}

            {/* Mobile Profile Link (NEW) */}
            {user && (
              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary flex items-center gap-2"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    className="w-8 h-8 rounded-full border border-border object-cover"
                    referrerPolicy="no-referrer"
                    alt="User Avatar"
                  />
                ) : (
                  <div className="w-8 h-8 bg-secondary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                My Profile
              </NavLink>
            )}

            {/* Mobile Login / Logout */}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-center px-5 py-3 rounded-md mt-3 bg-destructive text-destructive-foreground font-medium"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-md mt-3 bg-primary text-primary-foreground font-medium"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;