"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Star, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function SuggestedForYou() {
  const { productsList, addToCart, isInWishlist, removeFromWishlist, addToWishlist } = useApp();

  // ONLY appear when products are explicitly ticked with promotion flags by the Admin
  const displayedProducts = productsList
    ? productsList.filter((p) => p.isFeatured || p.isDealOfDay || p.inSpotlight || p.inHeroBanner || p.inPromoBanner)
    : [];

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className="px-3 sm:px-6 max-w-7xl mx-auto py-3">
      {/* Header with Title and Dark Circular Arrow Button */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight">
          Suggested For You
        </h2>
        <Link
          href="/shop"
          className="w-8 h-8 rounded-full bg-[#111827] hover:bg-black text-white flex items-center justify-center shadow transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="View all suggestions"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3-Column / 2-Row Grid of Actual Admin-Added Products */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {displayedProducts.map((product) => {
          const isFav = isInWishlist(product.id);
          const buyAtPrice = Math.round(product.basePrice * 0.96);
          const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative group"
            >
              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isFav) removeFromWishlist(product.id);
                  else addToWishlist(product);
                }}
                className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center cursor-pointer transition-all ${
                  isFav ? "text-red-500 fill-red-500" : "text-slate-400 hover:text-red-500"
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
              </button>

              {/* Product Image */}
              <Link href={`/shop/${product.slug}`} className="block relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                <img
                  src={imgUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-xs text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                  <span>{product.rating || 4.5}</span>
                  <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                </div>
              </Link>

              {/* Details */}
              <div className="space-y-1">
                <Link href={`/shop/${product.slug}`}>
                  <h3
                    className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors"
                    title={product.title}
                  >
                    {product.title}
                  </h3>
                </Link>

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

                <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 font-mono">
                  Buy at {formatPrice(buyAtPrice)}
                </p>

                <button
                  type="button"
                  onClick={() => addToCart(product.id)}
                  className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs py-1.5 px-2 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
