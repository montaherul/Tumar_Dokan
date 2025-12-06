import React, { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading } = useAuth(); // Get user, firebaseUser, and authLoading from AuthContext

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user || !firebaseUser) {
        // If not logged in, redirect to login after authLoading is false
        if (!authLoading) {
          navigate("/login");
        }
        return;
      }

      setWishlistLoading(true);
      setError("");
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/wishlist/user/${user.uid}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();

        if (response.ok) {
          // Wishlist items are populated with productId details
          setWishlistItems(data.map(item => ({
            ...item.productId, // Spread product details directly
            wishlistId: item._id, // Keep wishlist item ID if needed for removal
            id: item.productId._id, // Ensure a consistent 'id' for keys and links
          })));
        } else {
          setError(data.message || "Failed to fetch wishlist items.");
          setWishlistItems([]);
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Network error or server unavailable.");
        setWishlistItems([]);
      } finally {
        setWishlistLoading(false);
      }
    };

    if (!authLoading) { // Only fetch once auth state is determined
      fetchWishlist();
    }
  }, [user, firebaseUser, authLoading, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!user || !firebaseUser) {
      alert("You must be logged in to remove items from your wishlist.");
      navigate("/login");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this item from your wishlist?")) {
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Item removed from wishlist!");
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
      } else {
        alert(`Failed to remove item: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  if (authLoading || wishlistLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-destructive font-bold">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Your Wishlist
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Items you've saved for later.
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <p className="text-muted-foreground text-lg mb-6">
                Your wishlist is empty. Start browsing to save your favorite items!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-sky-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center bg-card p-4 rounded-lg shadow-sm border border-border"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-contain rounded-md mr-4 mb-4 sm:mb-0"
                  />
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                    <Link
                      to={`/products/${item.id}`}
                      className="text-primary hover:underline text-sm font-medium px-3 py-2 rounded-md bg-secondary hover:bg-muted transition-colors"
                    >
                      View Product
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="text-destructive hover:underline text-sm font-medium px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;