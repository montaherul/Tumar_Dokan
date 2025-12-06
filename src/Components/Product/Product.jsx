import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../CartContext/CartContext"; // NEW: Import useCart hook
import { ShoppingCart } from 'lucide-react'; // NEW: Import ShoppingCart icon

const Product = ({ pdt }) => {
  const { _id, title, image, description, price, discountPercentage } = pdt; // NEW: discountPercentage
  const { addItemToCart } = useCart(); // NEW: Get addItemToCart from CartContext
  const [isAdding, setIsAdding] = useState(false); // NEW: State for loading indicator

  const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    const result = await addItemToCart(_id, 1); // Add 1 quantity of this product
    if (result.success) {
      alert("Item added to cart!");
    } else {
      alert(`Failed to add item to cart: ${result.message}`);
    }
    setIsAdding(false);
  };

  return (
    <div className="group flex flex-col bg-card rounded-xl shadow-sm hover:shadow-lg border border-border transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-[480px]"> {/* Added fixed height */}
      {/* Image Container */}
      <div className="relative h-56 w-full bg-secondary p-4 flex items-center justify-center overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={title}
          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Title & Price */}
        <div className="flex justify-between items-start mb-2">
          <h3
            className="text-lg font-bold text-foreground line-clamp-2"
            title={title}
          >
            {title}
          </h3>
          <div className="flex flex-col items-end">
            {discountPercentage > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                ${price.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Description (Truncated to 2 lines) */}
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <Link to={`/products/${_id}`} className="flex-1">
            <button className="w-full py-3 px-4 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-muted transition-colors duration-300 flex items-center justify-center gap-2">
              View Details
            </button>
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-auto py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-sky-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-primary/60 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <svg className="animate-spin h-5 w-5 text-primary-foreground" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;