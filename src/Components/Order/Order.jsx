import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";

const Order = () => {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth(); // Get user and firebaseUser from AuthContext

  const product = useLoaderData();
  const { _id, title, price, image, description, discountPercentage } = product; // Use _id from MongoDB, get discountPercentage

  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  const [loading, setLoading] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [mapEmbedLink, setMapEmbedLink] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  useEffect(() => {
    if (user) { // Use the custom user object from AuthContext
      setCustomerName(user.name || "");
      setPhone(user.phoneNumber || ""); // Pre-fill phone if available
      // You might want to pre-fill address if available in user profile
      // setPhysicalAddress(user.addresses?.[0]?.street || "");
    } else {
      // This case should ideally be caught by ProtectedRoute, but good for fallback
      navigate("/login");
    }
  }, [user, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user || !firebaseUser) { // Ensure both custom user and firebaseUser are available
      alert("You must be logged in to place an order.");
      navigate("/login");
      setLoading(false);
      return;
    }

    let initialStatus = "Pending";
    if (paymentMethod === "bKash" || paymentMethod === "Nagad") {
      initialStatus = "Payment Pending";
    }

    try {
      const orderData = {
        productId: _id, // Use MongoDB _id
        productTitle: title,
        productImage: image,
        unitPrice: discountedPrice, // NEW: Send discounted unit price
        orderedQuantity: 1, // NEW: For single product order, quantity is 1
        totalItemPrice: discountedPrice, // NEW: Total price for this item (unitPrice * quantity)
        customerName: customerName,
        email: user.email,
        userId: user.uid, // Use user.uid (Firebase UID)
        physicalAddress: physicalAddress,
        mapEmbedLink: mapEmbedLink,
        phone: phone,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod !== "Cash on Delivery" ? transactionId : null,
        senderNumber: paymentMethod !== "Cash on Delivery" ? senderNumber : null,
        status: initialStatus,
      };

      const token = await firebaseUser.getIdToken(); // Get Firebase ID token
      const response = await fetch("http://localhost:5000/api/orders", { // New orders API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Send Firebase ID token for authentication
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Order Placed Successfully! Please check your dashboard for updates.");
        navigate("/dashboard");
      } else {
        alert(`Failed to place order: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Complete Your Order
            </h1>
            <p className="mt-2 text-slate-600">Secure checkout</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Product Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-center">
                  <img
                    src={image}
                    alt={title}
                    className="h-48 object-contain mix-blend-multiply"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">
                      ${discountedPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between text-sm font-medium text-slate-900">
                      <span>Total</span>
                      <span>${discountedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Shipping & Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Shipping & Payment Details
                </h2>

                {/* FORM START */}
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="block w-full rounded-lg border-slate-300 border px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition shadow-sm outline-none"
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="physicalAddress"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Physical Address
                      </label>
                      <input
                        type="text"
                        id="physicalAddress"
                        placeholder="e.g., 123 Main St, City, Country"
                        required
                        value={physicalAddress}
                        onChange={(e) => setPhysicalAddress(e.target.value)}
                        className="block w-full rounded-lg border-slate-300 border px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition shadow-sm outline-none"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Street, city, state/province, postal code.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="mapEmbedLink"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Google Maps Embed Link (Optional)
                      </label>
                      <input
                        type="url"
                        id="mapEmbedLink"
                        placeholder="e.g., https://www.google.com/maps/embed?pb=..."
                        value={mapEmbedLink}
                        onChange={(e) => setMapEmbedLink(e.target.value)}
                        className="block w-full rounded-lg border-slate-300 border px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition shadow-sm outline-none"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Find this by clicking "Share" then "Embed a map" on Google Maps.
                      </p>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label
                      htmlFor="contact"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Contact Number
                    </label>
                    <input
                      type="text"
                      id="contact"
                      placeholder="+1 (555) 000-0000"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border-slate-300 border px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition shadow-sm outline-none"
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">
                      Select Payment Method
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Cash on Delivery"
                          checked={paymentMethod === "Cash on Delivery"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-indigo-600"
                        />
                        <span className="text-sm text-slate-700">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bKash"
                          checked={paymentMethod === "bKash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-indigo-600"
                        />
                        <span className="text-sm text-slate-700">bKash</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Nagad"
                          checked={paymentMethod === "Nagad"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-indigo-600"
                        />
                        <span className="text-sm text-slate-700">Nagad</span>
                      </label>
                    </div>

                    {(paymentMethod === "bKash" || paymentMethod === "Nagad") && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-sm text-indigo-800">
                        <p className="font-semibold mb-2">
                          Please send ${discountedPrice.toFixed(2)} to our {paymentMethod} number:{" "}
                          <span className="font-bold">01875989022</span>
                        </p>
                        <p className="mb-3">
                          After successful payment, enter the transaction ID and your sender number below.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor="transactionId"
                              className="block text-xs font-medium text-indigo-700 mb-1"
                            >
                              Transaction ID
                            </label>
                            <input
                              type="text"
                              id="transactionId"
                              required
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="block w-full rounded-lg border-indigo-300 border px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm transition shadow-sm outline-none"
                              placeholder="e.g., 8A7B6C5D4E"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="senderNumber"
                              className="block text-xs font-medium text-indigo-700 mb-1"
                            >
                              Your {paymentMethod} Sender Number
                            </label>
                            <input
                              type="text"
                              id="senderNumber"
                              required
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              className="block w-full rounded-lg border-indigo-300 border px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm transition shadow-sm outline-none"
                              placeholder="e.g., 01XXXXXXXXX"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all transform ${
                        loading
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      }`}
                    >
                      {loading
                        ? "Processing Order..."
                        : `Confirm & Pay $${discountedPrice.toFixed(2)}`}
                    </button>
                    <p className="mt-4 text-center text-xs text-slate-400">
                      Payments are secure and encrypted.
                    </p>
                  </div>
                </form>
                {/* FORM END */}
              </div>
            </div>
          </div>
        </div>
      </div>
       <Footer />
    </>
  );
};

export default Order;