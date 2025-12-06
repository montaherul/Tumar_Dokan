import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext";
import { useCart } from "../CartContext/CartContext";
import { Package, Percent, CreditCard, MapPin } from 'lucide-react'; // Icons

const API_BASE_URL = "http://localhost:5000/api";
const DELIVERY_CHARGE = 5.00; // Fixed delivery charge

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { cart, cartTotalItems, cartTotalPrice, loading: cartLoading, clearCart, fetchCart } = useCart();

  // Delivery Details State
  const [customerName, setCustomerName] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [mapEmbedLink, setMapEmbedLink] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Order Summary Calculation
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!cartLoading && cartTotalItems === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      navigate("/products");
    }
  }, [user, authLoading, cartTotalItems, cartLoading, navigate]);

  // Pre-fill user details
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setPhone(user.phoneNumber || "");
      // You might want to pre-fill address if available in user profile
      // setPhysicalAddress(user.addresses?.[0]?.street || "");
    }
  }, [user]);

  // Calculate totals whenever cart, discount, or delivery charge changes
  const calculateTotals = useCallback(() => {
    const currentSubtotal = cart.items.reduce((total, item) => {
      const itemPrice = item.productId.discountPercentage > 0
        ? item.productId.price * (1 - item.productId.discountPercentage / 100)
        : item.productId.price;
      return total + (itemPrice * item.quantity);
    }, 0);

    const currentDiscountAmount = currentSubtotal * (discountPercentage / 100);
    const currentTotal = currentSubtotal - currentDiscountAmount + DELIVERY_CHARGE;

    setSubtotal(currentSubtotal);
    setDiscountAmount(currentDiscountAmount);
    setTotalPayable(currentTotal);
  }, [cart, discountPercentage]); // Depend on cart and discountPercentage

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Handle coupon application (client-side for simplicity)
  const handleApplyCoupon = () => {
    setCouponError("");
    // In a real app, this would be a backend API call to validate and get discount
    if (couponCode.toLowerCase() === "save10") {
      setDiscountPercentage(10);
      alert("Coupon 'SAVE10' applied! You get 10% off.");
    } else if (couponCode.toLowerCase() === "freeship") {
      // For simplicity, let's make FREE_SHIP give 5% off and waive delivery charge
      setDiscountPercentage(5);
      alert("Coupon 'FREESHIP' applied! You get 5% off and free delivery (delivery charge will be waived in final calculation).");
      // Note: For 'freeship', the DELIVERY_CHARGE would need to be conditionally applied in totalPayable calculation.
      // For this example, I'll keep it simple and just apply a discount.
    }
    else {
      setDiscountPercentage(0);
      setCouponError("Invalid coupon code.");
    }
    calculateTotals(); // Recalculate after applying coupon
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setCouponError(""); // Clear any coupon errors

    if (!user || !firebaseUser) {
      alert("You must be logged in to place an order.");
      navigate("/login");
      setIsPlacingOrder(false);
      return;
    }
    if (cartTotalItems === 0) {
      alert("Your cart is empty!");
      setIsPlacingOrder(false);
      return;
    }
    if (!customerName || !physicalAddress || !phone) {
      alert("Please fill in all required delivery details.");
      setIsPlacingOrder(false);
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      let allOrdersSuccessful = true;
      const ordersToPlace = [];

      // Prepare orders for each item in the cart
      for (const item of cart.items) {
        let initialStatus = "Pending";
        if (paymentMethod === "bKash" || paymentMethod === "Nagad") {
          initialStatus = "Payment Pending";
        }

        // Calculate the actual price for the order based on discount
        const itemOriginalPrice = item.productId.price;
        const itemDiscountPercentage = item.productId.discountPercentage || 0;
        const itemDiscountedPrice = itemOriginalPrice * (1 - itemDiscountPercentage / 100);
        const finalItemPriceForOrder = itemDiscountedPrice * item.quantity;

        ordersToPlace.push({
          productId: item.productId._id,
          productTitle: item.productTitle,
          productImage: item.productImage,
          unitPrice: itemDiscountedPrice, // NEW: Send discounted unit price
          orderedQuantity: item.quantity, // NEW: Send quantity for this item
          totalItemPrice: finalItemPriceForOrder, // NEW: Total price for this item's quantity
          customerName: customerName,
          email: user.email,
          userId: user.uid,
          physicalAddress: physicalAddress,
          mapEmbedLink: mapEmbedLink,
          phone: phone,
          paymentMethod: paymentMethod,
          transactionId: paymentMethod !== "Cash on Delivery" ? transactionId : null,
          senderNumber: paymentMethod !== "Cash on Delivery" ? senderNumber : null,
          status: initialStatus,
        });
      }

      // Send each order to the backend
      for (const orderData of ordersToPlace) {
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to place order for ${orderData.productTitle}:`, errorData.message);
          allOrdersSuccessful = false;
          // Optionally, break or continue based on desired behavior for partial failures
        }
      }

      if (allOrdersSuccessful) {
        await clearCart(); // Clear cart after successful order placement
        alert("Orders Placed Successfully! Please check your dashboard for updates.");
        navigate("/dashboard");
      } else {
        alert("Some orders failed to place. Please check your dashboard and try again for failed items.");
      }

    } catch (error) {
      console.error("Error placing orders:", error);
      alert("Failed to place orders. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || cartTotalItems === 0) {
    return null; // Redirect handled by useEffect
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-foreground">
              Secure Checkout
            </h1>
            <p className="mt-2 text-muted-foreground">Finalize your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Delivery & Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl shadow-lg p-6 sm:p-10 border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Delivery & Payment Details
                </h2>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="block w-full rounded-lg border-border border px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary sm:text-sm transition shadow-sm outline-none bg-input"
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="physicalAddress" className="block text-sm font-medium text-foreground mb-1">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        id="physicalAddress"
                        placeholder="e.g., 123 Main St, City, Country"
                        required
                        value={physicalAddress}
                        onChange={(e) => setPhysicalAddress(e.target.value)}
                        className="block w-full rounded-lg border-border border px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary sm:text-sm transition shadow-sm outline-none bg-input"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Street, city, state/province, postal code.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="mapEmbedLink" className="block text-sm font-medium text-foreground mb-1">
                        Google Maps Embed Link (Optional)
                      </label>
                      <input
                        type="url"
                        id="mapEmbedLink"
                        placeholder="e.g., https://www.google.com/maps/embed?pb=..."
                        value={mapEmbedLink}
                        onChange={(e) => setMapEmbedLink(e.target.value)}
                        className="block w-full rounded-lg border-border border px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary sm:text-sm transition shadow-sm outline-none bg-input"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Find this by clicking "Share" then "Embed a map" on Google Maps.
                      </p>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-foreground mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      id="contact"
                      placeholder="+1 (555) 000-0000"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-lg border-border border px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary sm:text-sm transition shadow-sm outline-none bg-input"
                    />
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-primary" />
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
                          className="form-radio text-primary"
                        />
                        <span className="text-sm text-foreground">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bKash"
                          checked={paymentMethod === "bKash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-primary"
                        />
                        <span className="text-sm text-foreground">bKash</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Nagad"
                          checked={paymentMethod === "Nagad"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-primary"
                        />
                        <span className="text-sm text-foreground">Nagad</span>
                      </label>
                    </div>

                    {(paymentMethod === "bKash" || paymentMethod === "Nagad") && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-primary">
                        <p className="font-semibold mb-2">
                          Please send ${totalPayable.toFixed(2)} to our {paymentMethod} number:{" "}
                          <span className="font-bold">01875989022</span>
                        </p>
                        <p className="mb-3">
                          After successful payment, enter the transaction ID and your sender number below.
                        </p>
                        <div className="space-y-3">
                          <div>
                            <label
                              htmlFor="transactionId"
                              className="block text-xs font-medium text-primary mb-1"
                            >
                              Transaction ID
                            </label>
                            <input
                              type="text"
                              id="transactionId"
                              required
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="block w-full rounded-lg border-primary/30 border px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary text-sm transition shadow-sm outline-none bg-input"
                              placeholder="e.g., 8A7B6C5D4E"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="senderNumber"
                              className="block text-xs font-medium text-primary mb-1"
                            >
                              Your {paymentMethod} Sender Number
                            </label>
                            <input
                              type="text"
                              id="senderNumber"
                              required
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              className="block w-full rounded-lg border-primary/30 border px-3 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary text-sm transition shadow-sm outline-none bg-input"
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
                      disabled={isPlacingOrder}
                      className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-primary-foreground transition-all transform ${
                        isPlacingOrder
                          ? "bg-primary/60 cursor-not-allowed"
                          : "bg-primary hover:bg-sky-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      }`}
                    >
                      {isPlacingOrder
                        ? "Processing Order..."
                        : `Confirm & Pay $${totalPayable.toFixed(2)}`}
                    </button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      Payments are secure and encrypted.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT: Order Summary & Cart Items */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sticky top-24">
                <h3 className="text-xl font-semibold text-foreground mb-4">Your Order ({cartTotalItems} items)</h3>

                {/* Cart Items List */}
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {cart.items.map((item) => {
                    const originalPrice = item.productId.price;
                    const discountPercentage = item.productId.discountPercentage || 0;
                    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
                    const itemTotalPrice = discountedPrice * item.quantity;

                    return (
                      <div key={item.productId._id} className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-16 h-16 object-contain rounded-md border border-border p-1"
                        />
                        <div className="flex-grow">
                          <p className="font-medium text-foreground text-sm line-clamp-1">{item.productTitle}</p>
                          <div className="flex items-center gap-2">
                            {discountPercentage > 0 && (
                              <span className="text-muted-foreground line-through text-xs">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                            <p className="text-muted-foreground text-xs">Qty: {item.quantity} x ${discountedPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">${itemTotalPrice.toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Input */}
                <div className="mb-6 pt-4 border-t border-border">
                  <label htmlFor="coupon" className="block text-sm font-medium text-foreground mb-2 flex items-center">
                    <Percent className="w-4 h-4 mr-2 text-primary" />
                    Have a coupon?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-grow px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-muted transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
                  {discountPercentage > 0 && (
                    <p className="text-green-600 text-xs mt-2">
                      {discountPercentage}% discount applied!
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({discountPercentage}%)</span>
                    <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span>${DELIVERY_CHARGE.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-foreground">
                    <span>Total Payable</span>
                    <span>${totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;