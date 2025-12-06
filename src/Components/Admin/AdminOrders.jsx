import React, { useState, useEffect } from "react";
import Navigation from "../Navigation/Navigation";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import Footer from "../../Footer/Footer";
import MapModal from "../MapModal/MapModal"; // Import the new MapModal component
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading } = useAuth(); // Get user, firebaseUser and loading from AuthContext

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false); // State for modal visibility
  const [currentMapUrl, setCurrentMapUrl] = useState(""); // State for map URL

  const STATUS_OPTIONS = ["Payment Pending", "Pending", "Processing", "Delivered", "Cancelled"];

  // Check admin login
  useEffect(() => {
    if (!loading) {
      if (user && user.role === 'admin' && firebaseUser) { // Check user role from AuthContext and firebaseUser
        fetchOrders();
      } else {
        alert("Access Denied: You are not an Admin.");
        navigate("/dashboard");
      }
    }
  }, [user, firebaseUser, loading, navigate]);

  // Fetch Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = await firebaseUser.getIdToken(); // Get Firebase ID token
      const response = await fetch("http://localhost:5000/api/orders", { // New orders API endpoint
        headers: {
          'x-auth-token': token, // Send Firebase ID token for authentication
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming backend returns orders with a 'createdAt' field that is a string/ISO date
        const ordersList = data.map(order => ({
          ...order,
          docId: order._id, // Use MongoDB _id as docId for consistency
          date: new Date(order.createdAt), // Convert string to Date object
        }));
        setOrders(ordersList);
      } else {
        throw new Error(data.message || "Failed to fetch orders from backend.");
      }
      setOrdersLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Check console for permissions error or backend status.");
      setOrdersLoading(false);
    }
  };

  // Update Order Status
  const handleStatusChange = async (orderDocId, newStatus) => {
    setUpdatingId(orderDocId);

    try {
      const token = await firebaseUser.getIdToken(); // Get Firebase ID token
      const response = await fetch(`http://localhost:5000/api/orders/${orderDocId}/status`, { // New API endpoint for status update
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.docId === orderDocId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        throw new Error(data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddressClick = (order) => {
    // Prioritize mapEmbedLink for modal
    if (order.mapEmbedLink && order.mapEmbedLink.startsWith("https://www.google.com/maps/embed?")) {
      setCurrentMapUrl(order.mapEmbedLink);
      setShowMapModal(true);
    } else if (order.physicalAddress) {
      // If no embed link, or it's not valid, use physical address for search
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(order.physicalAddress)}`, "_blank");
    } else {
      alert("No address or map link provided for this order.");
    }
  };

  const handleCloseMap = () => {
    setShowMapModal(false);
    setCurrentMapUrl("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "Payment Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"; // New color for Payment Pending
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // LOADING UI for auth
  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying Admin Access...</p>
          </div>
        </div>
      </>
    );
  }

  // ERROR UI for orders
  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-destructive font-bold">{error}</p>
        </div>
      </>
    );
  }

  // MAIN UI
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-6 sm:p-10">
        <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage customer orders.</p>
          </div>
          <div className="flex gap-3"> {/* Added flex container for buttons */}
            <Link to="/admin/products/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm shadow-sm hover:bg-sky-700 transition">
              Create Product
            </Link>
            <Link to="/admin/products" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-bold text-sm shadow-sm hover:bg-muted transition"> {/* NEW: Manage Products button */}
              Manage Products
            </Link>
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
              {orders.length} Orders
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordersLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.docId}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-5 border-b border-border flex justify-between items-start bg-background/50">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Order ID
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground" title={order.docId}>
                      #{order.docId.substring(0, 8)}...
                    </p>
                  </div>

                  {/* Status Selector */}
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.docId, e.target.value)
                      }
                      disabled={updatingId === order.docId}
                      className={`appearance-none px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer ${getStatusColor(
                        order.status
                      )} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {updatingId === order.docId && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card bg-opacity-70 rounded-full">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Item Details */}
                <div className="p-5 border-b border-border flex items-center gap-4 bg-background/50">
                  <img
                    src={order.productImage}
                    alt={order.productTitle}
                    className="w-16 h-16 object-contain rounded-md border border-border p-1"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground text-base">
                      {order.productTitle}
                    </h4>
                    <p className="text-lg font-bold text-primary">
                      ${Number(order.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Customer & Payment Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {order.customerName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {order.customerName || "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.phone || "No phone provided"}</p>
                      <p className="text-xs text-muted-foreground">{order.email}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Payment Details
                    </p>
                    <p className="text-sm text-foreground">
                      Method: <span className="font-semibold">{order.paymentMethod}</span>
                    </p>
                    {(order.paymentMethod === "bKash" || order.paymentMethod === "Nagad") && (
                      <>
                        <p className="text-sm text-foreground">
                          Txn ID: <span className="font-semibold">{order.transactionId || "N/A"}</span>
                        </p>
                        <p className="text-sm text-foreground">
                          Sender: <span className="font-semibold">{order.senderNumber || "N/A"}</span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* Address Display and Map Link */}
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Delivery Address
                    </p>
                    {order.physicalAddress ? (
                      <p className="text-sm text-foreground mb-2">{order.physicalAddress}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">No physical address provided.</p>
                    )}

                    {(order.mapEmbedLink || order.physicalAddress) ? (
                      <button
                        onClick={() => handleAddressClick(order)}
                        className="text-xs text-primary hover:underline bg-background/50 p-2 rounded border border-border flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {order.mapEmbedLink && order.mapEmbedLink.startsWith("https://www.google.com/maps/embed?") ? "View Map Location (Modal)" : "Search Address (New Tab)"}
                      </button>
                    ) : (
                      <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border">
                        📍 No map or address link provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto bg-background/50 p-5 border-t border-border flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.date).toLocaleDateString()}
                  </div>

                  {/* Price is now displayed with product details, so removing from footer */}
                  {/* <div className="text-lg font-bold text-primary">
                    ${order.price.toFixed(2)}
                  </div> */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Map Modal */}
      <MapModal mapUrl={currentMapUrl} onClose={handleCloseMap} />
       <Footer />
    </>
  );
};

export default AdminOrders;