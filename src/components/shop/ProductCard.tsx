"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/data/products";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Star, Heart, ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  hidePriceAndAdd?: boolean;
}

export default function ProductCard({ product, hidePriceAndAdd = false }: ProductCardProps) {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useApp();

  const inWishlist = isInWishlist(product.id);

  // Check if item is already in cart and get current quantity
  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateCartQuantity(cartItem.variantId, currentQuantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateCartQuantity(cartItem.variantId, currentQuantity + 1);
    }
  };

  // Special offer calculation (e.g. Buy at ₹...)
  const specialOfferPrice = Math.round(product.basePrice * 0.96);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative group select-none">
      {/* Top-Right Floating Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center cursor-pointer transition-all ${
          inWishlist
            ? "text-red-500 fill-red-500"
            : "text-slate-400 hover:text-red-500"
        }`}
        title={inWishlist ? "Remove Wishlist" : "Add Wishlist"}
      >
        <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500" : ""}`} />
      </button>

      {/* Product Image Frame (Exact square with rating badge) */}
      <Link href={`/shop/${product.slug}`} className="block relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
        <img
          src={product.imageUrls[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-xs text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
          <span>{product.rating || "4.4"}</span>
          <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
        </div>
      </Link>

      {/* Product Details */}
      <div className="space-y-1">
        <Link href={`/shop/${product.slug}`}>
          <h3
            className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>

        {/* Pricing */}
        {!hidePriceAndAdd && (
          <>
            <div className="flex items-baseline gap-1 pt-0.5">
              {product.mrp > product.basePrice && (
                <span className="text-[10px] text-slate-400 line-through font-mono">
                  {formatPrice(product.mrp)}
                </span>
              )}
              <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                {formatPrice(product.basePrice)}
              </span>
            </div>

            {/* Special Offer Line */}
            <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 font-mono">
              Buy at {formatPrice(specialOfferPrice)}
            </p>

            {/* Action Button: Quick Add & Quantity Selector */}
            <div className="pt-1">
              {currentQuantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs py-1.5 px-2 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              ) : (
                <div className="w-full bg-[#ff9f00] text-slate-950 rounded-xl p-0.5 flex items-center justify-between font-black text-xs shadow-xs border border-amber-600/30">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-6 h-6 rounded-lg bg-[#e68a00] hover:bg-[#cc7a00] text-slate-950 flex items-center justify-center transition-all shrink-0 active:scale-90 cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="flex items-center gap-1 px-1 select-none">
                    <span className="text-xs font-black text-slate-950">{currentQuantity}</span>
                    <span className="text-[9px] font-black text-slate-950 uppercase tracking-tight">
                      IN CART
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-6 h-6 rounded-lg bg-[#e68a00] hover:bg-[#cc7a00] text-slate-950 flex items-center justify-center transition-all shrink-0 active:scale-90 cursor-pointer"
                    title="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
