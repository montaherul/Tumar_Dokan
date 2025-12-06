import React, { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";
import { Edit, Trash2, PlusCircle } from 'lucide-react'; // Icons

const API_BASE_URL = "http://localhost:5000/api";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!authLoading) {
      if (user && user.role === 'admin' && firebaseUser) {
        fetchProducts();
        fetchCategories();
      } else {
        alert("Access Denied: You are not authorized to view product management.");
        navigate("/dashboard");
      }
    }
  }, [user, firebaseUser, authLoading, navigate]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    setError("");
    try {
      const query = selectedCategory === 'All' ? '' : `?category=${encodeURIComponent(selectedCategory)}`;
      const response = await fetch(`${API_BASE_URL}/products${query}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        throw new Error(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Check console for details.");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`); // Fetch all products to get categories
      const allProducts = await response.json();
      const uniqueCategories = ['All', ...new Set(allProducts.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Re-fetch products when selectedCategory changes
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin' && firebaseUser) {
      fetchProducts();
    }
  }, [selectedCategory, authLoading, user, firebaseUser]);


  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    setDeletingProductId(productId);
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        alert("Product deleted successfully!");
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(`Failed to delete product: ${err.message}`);
    } finally {
      setDeletingProductId(null);
    }
  };

  if (authLoading || productsLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
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
      <div className="min-h-screen bg-background p-6 sm:p-10">
        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
            <p className="text-muted-foreground">Add, edit, and delete products in your store.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center"> {/* Adjusted for mobile */}
            <Link to="/admin/products/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm shadow-sm hover:bg-sky-700 transition flex items-center gap-1">
              <PlusCircle className="w-4 h-4" /> Create Product
            </Link>
            <div className="w-full sm:w-40"> {/* Adjusted width for mobile */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-input text-foreground text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
              {products.length} Products
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-background/20 transition-colors relative">
                    {deletingProductId === product._id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card bg-opacity-70 z-10">
                        <div className="w-6 h-6 border-4 border-destructive border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-contain border border-border p-0.5" src={product.image} alt={product.title} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{product.title}</div>
                          <div className="text-xs text-muted-foreground">ID: {product._id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.discountPercentage > 0 ? `${product.discountPercentage}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row justify-end gap-2"> {/* Adjusted for mobile */}
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingProductId === product._id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-destructive-foreground bg-destructive hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminProducts;