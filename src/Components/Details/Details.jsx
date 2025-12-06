import React, { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook
import { useCart } from "../CartContext/CartContext"; // NEW: Import useCart hook
import Product from "../Product/Product"; // Import the Product component
import ReviewSection from "../ReviewSection/ReviewSection"; // Import the new ReviewSection
import { ShoppingCart } from 'lucide-react'; // NEW: Import ShoppingCart icon

const Details = () => {
  const product = useLoaderData();
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading } = useAuth(); // Get user, firebaseUser, and authLoading from AuthContext
  const { addItemToCart } = useCart(); // NEW: Get addItemToCart from CartContext

  // Destructure with fallbacks to prevent crashes
  const { _id, title, price, category, description, image, discountPercentage } = product || {}; // NEW: discountPercentage

  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistActionLoading, setWishlistActionLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // NEW: State for Add to Cart loading
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarProductsLoading, setSimilarProductsLoading] = useState(true);
  const [similarProductsError, setSimilarProductsError] = useState(null);


  const API_BASE_URL = "http://localhost:5000/api";

  // Check wishlist status on component mount or when user/product changes
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && firebaseUser && _id) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`${API_BASE_URL}/wishlist/status/${_id}`, {
            headers: {
              'x-auth-token': token,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setIsWishlisted(data.isWishlisted);
          } else {
            console.error("Failed to check wishlist status:", data.message);
            setIsWishlisted(false); // Assume not wishlisted on error
          }
        } catch (error) {
          console.error("Error checking wishlist status:", error);
          setIsWishlisted(false); // Assume not wishlisted on network error
        }
      } else {
        setIsWishlisted(false); // Not logged in or no product ID
      }
    };

    if (!authLoading) { // Only check once auth state is determined
      checkWishlistStatus();
    }
  }, [user, firebaseUser, _id, authLoading]);

  // Fetch similar products when the product category changes
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (category) {
        setSimilarProductsLoading(true);
        setSimilarProductsError(null);
        try {
          const response = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(category)}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Filter out the current product from the similar products list
          const filteredProducts = data.filter(p => p._id !== _id);
          setSimilarProducts(filteredProducts.slice(0, 4)); // Show up to 4 similar products
        } catch (err) {
          console.error("Error fetching similar products:", err);
          setSimilarProductsError("Failed to load similar products.");
        } finally {
          setSimilarProductsLoading(false);
        }
      }
    };

    fetchSimilarProducts();
  }, [category, _id]); // Re-run when category or current product ID changes

  // Function to add/remove product from wishlist
  const toggleWishlist = async () => {
    if (!user || !firebaseUser) {
      alert("Please log in to add items to your wishlist.");
      navigate("/login");
      return;
    }

    setWishlistActionLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const method = isWishlisted ? 'DELETE' : 'POST';
      const url = isWishlisted ? `${API_BASE_URL}/wishlist/${_id}` : `${API_BASE_URL}/wishlist`;
      const body = isWishlisted ? null : JSON.stringify({ productId: _id });

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(!isWishlisted); // Toggle state
        alert(isWishlisted ? "Removed from wishlist!" : "Added to wishlist!");
      } else {
        alert(`Failed to update wishlist: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistActionLoading(false);
    }
  };

  // NEW: Function to add product to cart
  const handleAddToCart = async () => {
    if (!user || !firebaseUser) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    setIsAddingToCart(true);
    const result = await addItemToCart(_id, 1); // Add 1 quantity of this product
    if (result.success) {
      alert("Item added to cart!");
    } else {
      alert(`Failed to add item to cart: ${result.message}`);
    }
    setIsAddingToCart(false);
  };

  // Helper to render static stars for the UI design
  const renderStars = () => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      <span className="text-sm text-muted-foreground ml-2">(4.8 stars)</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />

      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Products
        </button>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 items-start">
          {/* 1. Image Gallery Section */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-4 flex justify-center items-center mb-8 lg:mb-0">
            <div className="relative aspect-square w-full max-w-[500px] flex items-center justify-center overflow-hidden">
              <img
                src={image}
                alt={title}
                className="object-contain w-full h-full transform hover:scale-105 transition-transform duration-500"
              />
              {discountPercentage > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          </div>

          {/* 2. Product Info Section */}
          <div className="mt-10 px-2 sm:px-0 sm:mt-16 lg:mt-0">
            {/* Category & Rating */}
            <div className="flex justify-between items-center mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {category}
              </span>
              {renderStars()}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-4">
              {title}
            </h1>

            {/* Price */}
            <div className="mt-3 flex items-end">
              {discountPercentage > 0 && (
                <p className="text-2xl text-muted-foreground line-through mr-2">
                  ${price.toFixed(2)}
                </p>
              )}
              <p className="text-4xl font-bold text-primary">${discountedPrice.toFixed(2)}</p>
              <span className="ml-2 text-sm text-muted-foreground mb-2">USD</span>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="text-sm font-medium text-foreground">
                Description
              </h3>
              <div className="mt-4 prose prose-sm text-muted-foreground leading-relaxed">
                <p>{description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart} // NEW: Add to Cart button
                disabled={isAddingToCart || authLoading}
                className="flex-1 flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-primary-foreground bg-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 disabled:bg-primary/60 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-primary-foreground" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                Add to Cart
              </button>

              <Link to={`/products/order/${_id}`} className="flex-1">
                <button className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-primary-foreground bg-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Buy Now
                </button>
              </Link>

              <button
                onClick={toggleWishlist}
                disabled={wishlistActionLoading || authLoading}
                className={`flex-1 flex items-center justify-center px-8 py-4 border text-base font-medium rounded-xl transition-all ${
                  isWishlisted
                    ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
                    : "border-border text-foreground bg-card hover:bg-secondary"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                {wishlistActionLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                In Stock & Ready to Ship
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <section className="max-w-7xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Similar Products</h2>
          {similarProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : similarProductsError ? (
            <p className="text-center text-destructive">Error loading similar products: {similarProductsError}</p>
          ) : similarProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">No similar products found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map((similarProduct) => (
                <Product key={similarProduct._id} pdt={similarProduct} />
              ))}
            </div>
          )}
        </section>

        {/* Customer Reviews Section */}
        {_id && <ReviewSection productId={_id} />}
      </div>
      <Footer />
    </div>
  );
};

export default Details;