import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading, logout } = useAuth(); // Get user, firebaseUser, loading, and logout from AuthContext

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true); // Renamed to avoid conflict with auth loading

  // 1. CHECK LOGIN STATUS & REDIRECT IF NOT LOGGED IN
  useEffect(() => {
    if (!loading && !user) { // Check for custom user object
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // 2. FETCH ORDERS FOR THIS USER
  useEffect(() => {
    if (!user || !firebaseUser) return; // Ensure both custom user and firebaseUser are available

    setOrdersLoading(true);
    const fetchUserOrders = async () => {
      try {
        const token = await firebaseUser.getIdToken(); // Get Firebase ID token
        const response = await fetch(`http://localhost:5000/api/orders/user/${user.uid}`, { // Use user.uid (Firebase UID)
          headers: {
            'x-auth-token': token, // Send Firebase ID token for authentication
          }
        });
        const data = await response.json();

        if (response.ok) {
          const ordersList = data.map(order => ({
            ...order,
            docId: order._id, // Use MongoDB _id as docId for consistency
            date: new Date(order.createdAt), // Convert string to Date object
          }));
          setOrders(ordersList);
        } else {
          console.error("Failed to fetch orders:", data.message);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchUserOrders();

  }, [user, firebaseUser]); // Depend on user and firebaseUser

  // 3. LOGOUT FUNCTION
  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate('/login'); // Navigate after logout
  };

  // Placeholder for cancelOrder function (will need backend API)
  const cancelOrder = async (orderId) => {
    if (!firebaseUser) {
      alert("You must be logged in to cancel an order.");
      navigate("/login");
      return;
    }
    
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order canceled successfully.");
        // Update local state to reflect cancellation
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.docId === orderId ? { ...order, status: 'Cancelled' } : order
          )
        );
      } else {
        alert(`Failed to cancel order: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel order. Try again.");
    }
  };


  // Show loading state for auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, it means navigate("/login") has been called.
  if (!user) return null;


  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* User Profile Section */}
          <div className="bg-card p-6 rounded-xl shadow-sm mb-8 border border-border text-center">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0EA5E9&color=fff`}
              alt="User Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/20 object-cover"
            />

            <h2 className="text-2xl font-bold text-foreground mb-1">
              Welcome, {user?.name || "User"} 👋
            </h2>

            <p className="text-muted-foreground text-sm">{user?.email}</p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3"> {/* Adjusted for mobile */}
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-destructive text-destructive-foreground rounded-lg shadow-sm hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Logout
              </button>
              {user?.role === 'admin' && ( // Updated to check user.role
                <>
                  <button
                    onClick={() => navigate("/admin/orders")}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-sky-700 transition-colors text-sm font-medium"
                  >
                    Admin Panel
                  </button>
                  <button
                    onClick={() => navigate("/admin/users")} 
                  
                    className="px-5 py-2 bg-secondary text-secondary-foreground rounded-lg shadow-sm hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Manage Users
                  </button>
                </>
              )}
              <Link to="/editprofile" className="px-5 py-2 bg-secondary text-secondary-foreground rounded-lg shadow-sm hover:bg-muted transition-colors text-sm font-medium">
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Order List Section */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Your Orders ({orders.length})
            </h3>

            {ordersLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders found. Start shopping!</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.docId}
                    className="border border-border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm bg-background/50"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-20 h-20 object-contain rounded-md border border-border p-1"
                      />

                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          {order.productTitle}
                        </h4>

                        <p className="text-sm text-muted-foreground">
                          Order ID:{" "}
                          <span className="font-medium text-foreground">{order.orderId}</span>
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                              order.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xl font-bold text-primary">
                        ${Number(order.totalItemPrice).toFixed(2)} {/* Changed to totalItemPrice */}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString() // createdAt is now a string/ISO date
                          : "Processing..."}
                      </p>

                      {/* CANCEL BUTTON (Only show if Pending) */}
                      {order.status === "Pending" && (
                        <button
                          onClick={() => cancelOrder(order.docId)}
                          className="mt-3 bg-destructive text-destructive-foreground text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-colors font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="text-primary font-semibold hover:underline text-lg"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
       <Footer />
    </>
  );
};

export default Dashboard;