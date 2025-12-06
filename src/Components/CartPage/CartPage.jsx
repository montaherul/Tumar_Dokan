import React, { useState } from 'react';
import Navigation from '../Navigation/Navigation';
import Footer from '../../Footer/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext/CartContext';
import { ShoppingCart, MinusCircle, PlusCircle, Trash2 } from 'lucide-react'; // Icons

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotalItems, cartTotalPrice, loading, error, updateItemQuantity, removeItemFromCart, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState({}); // State to track loading for individual item updates

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    const result = await updateItemQuantity(productId, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
    setIsUpdating(prev => ({ ...prev, [productId]: false }));
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    const result = await removeItemFromCart(productId);
    if (!result.success) {
      alert(result.message);
    }
    setIsUpdating(prev => ({ ...prev, [productId]: false }));
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }
    const result = await clearCart();
    if (!result.success) {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cart...</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Your Shopping Cart
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Review your items before checkout.
            </p>
          </div>

          {cartTotalItems === 0 ? (
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <p className="text-muted-foreground text-lg mb-6">
                Your cart is empty. Start adding some amazing products!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-sky-700 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => {
                  const originalPrice = item.productId.price;
                  const discountPercentage = item.productId.discountPercentage || 0;
                  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
                  const itemTotalPrice = discountedPrice * item.quantity;

                  return (
                    <div
                      key={item.productId._id}
                      className="flex flex-col sm:flex-row items-center bg-card p-4 rounded-lg shadow-sm border border-border relative"
                    >
                      {isUpdating[item.productId._id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-card bg-opacity-70 rounded-lg z-10">
                          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-24 h-24 object-contain rounded-md mr-4 mb-4 sm:mb-0 border border-border p-1"
                      />
                      <div className="flex-grow text-center sm:text-left">
                        <Link to={`/products/${item.productId._id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {item.productTitle}
                        </Link>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          {discountPercentage > 0 && (
                            <span className="text-muted-foreground line-through text-sm">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                          <p className="text-primary font-medium">${discountedPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start mt-2 space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating[item.productId._id]}
                            className="p-1 rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          <span className="font-medium text-foreground w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={isUpdating[item.productId._id]}
                            className="p-1 rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center sm:items-end mt-4 sm:mt-0">
                        <p className="text-xl font-bold text-primary">${itemTotalPrice.toFixed(2)}</p>
                        <button
                          onClick={() => handleRemoveItem(item.productId._id)}
                          disabled={isUpdating[item.productId._id]}
                          className="mt-2 text-destructive hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleClearCart}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg shadow-sm hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6 sticky top-24">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({cartTotalItems} items)</span>
                      <span>${cartTotalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Estimate</span>
                      <span>$5.00</span> {/* Placeholder */}
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax Estimate</span>
                      <span>$0.00</span> {/* Placeholder */}
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-foreground">
                      <span>Order Total</span>
                      <span>${(cartTotalPrice + 5.00).toFixed(2)}</span> {/* Add shipping */}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full mt-6 py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-sky-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Shipping and taxes calculated at checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;