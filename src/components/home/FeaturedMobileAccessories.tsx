"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, Heart, ArrowRight, Star, ShoppingCart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function FeaturedMobileAccessories() {
  const { productsList, addToCart, isInWishlist, removeFromWishlist, addToWishlist } = useApp();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 2 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ONLY appear when products are explicitly ticked as isFeatured by the Admin
  const featuredItems = productsList ? productsList.filter((p) => p.isFeatured) : [];
  if (featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="px-3 sm:px-6 max-w-7xl mx-auto py-3">
      {/* Container Frame matching Screenshot 3 */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
        
        {/* Header with Title & Fire Icon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                POPULAR DEALS
              </span>
              <h2 className="text-base sm:text-xl font-black text-slate-900 font-display tracking-tight">
                Featured Mobile Accessories
              </h2>
            </div>
            <p className="text-xs text-slate-500 pl-10 font-medium">
              Top Trending Accessories for Apple, Samsung, OnePlus, Pixel & Xiaomi
            </p>
          </div>

          {/* Countdown Timer Pill */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-bold text-blue-900">
              Fast Shipping Ends In:
            </span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-blue-700">
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              :
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              :
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column / 6-Card Grid of Real Products from Admin */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 pt-1">
          {featuredItems.map((product) => {
            const isFav = isInWishlist(product.id);
            const buyAtPrice = Math.round(product.basePrice * 0.96);
            const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative group"
              >
                {/* Wishlist Heart */}
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

                {/* Image */}
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

                {/* Title & Price */}
                <div className="space-y-1">
                  <Link href={`/shop/${product.slug}`}>
                    <h3
                      className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </Link>

                  <div className="pt-0.5">
                    <p className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      {formatPrice(product.basePrice)}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 font-mono">
                      Buy at {formatPrice(buyAtPrice)}
                    </p>
                  </div>

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

        {/* View All Accessories Button */}
        <div className="pt-2 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 px-8 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.01]"
          >
            <span>View All Accessories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
