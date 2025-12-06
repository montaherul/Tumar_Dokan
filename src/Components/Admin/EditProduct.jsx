import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID from URL
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(""); // NEW: Discount percentage
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (user && user.role === 'admin' && firebaseUser) {
        fetchProductDetails();
      } else {
        alert("Access Denied: You are not authorized to edit products.");
        navigate("/dashboard");
      }
    }
  }, [user, firebaseUser, authLoading, navigate, id]);

  const fetchProductDetails = async () => {
    setLoadingProduct(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();

      if (response.ok) {
        setTitle(data.title);
        setPrice(data.price);
        setDescription(data.description);
        setCategory(data.category);
        setImage(data.image);
        setStock(data.stock);
        setDiscountPercentage(data.discountPercentage || 0); // Set discount, default to 0
      } else {
        throw new Error(data.message || "Failed to fetch product details.");
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details. Check console for details.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!user || !firebaseUser) {
      setError("You must be logged in to edit a product.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          title,
          price: parseFloat(price),
          description,
          category,
          image,
          stock: parseInt(stock, 10),
          discountPercentage: parseFloat(discountPercentage), // Include discount
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Product updated successfully!");
        setTimeout(() => navigate("/admin/products"), 1500); // Redirect to product list
      } else {
        setError(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Network error or server unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loadingProduct) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
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
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-3xl w-full bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <div className="bg-card border-b border-border px-8 py-6">
            <h2 className="text-2xl font-bold text-foreground">
              Edit Product: {title}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Modify the details of this product.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                Product Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            {/* NEW: Discount Percentage */}
            <div>
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-foreground mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                id="discountPercentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-foreground mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              {image && (
                <div className="mt-4 flex justify-center">
                  <img src={image} alt="Product Preview" className="max-h-48 object-contain rounded-lg border border-border" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-sky-700 focus:ring-4 focus:ring-primary/30 transition shadow-sm disabled:bg-primary/60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProduct;