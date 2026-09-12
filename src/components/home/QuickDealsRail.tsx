"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function QuickDealsRail() {
  const { user, recentlyViewed, productsList } = useApp();

  // Strictly filter products: if a product was deleted from the shop, it must immediately disappear from here
  const activeRecentlyViewed = useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0 || !productsList) return [];
    return recentlyViewed.filter((rv) => {
      if (!rv || !rv.id) return false;
      return productsList.some(
        (p) => (p.id === rv.id || p.slug === rv.slug) && p.stockStatus !== "out_of_stock"
      );
    });
  }, [recentlyViewed, productsList]);

  // If no valid active products remain in the shop, do not display this rail
  if (activeRecentlyViewed.length === 0) {
    return null;
  }

  const titleText = user?.name
    ? `${user.name}, still looking for these?`
    : "Still looking for these?";

  return (
    <section className="px-3 sm:px-6 max-w-7xl mx-auto py-2">
      {/* Personalized Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
          {titleText}
        </h3>
        <Link
          href="/shop"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Horizontal Rail of Actually Browsed Products */}
      <div className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {activeRecentlyViewed.map((product) => {
          const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";
          return (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="flex-shrink-0 w-28 sm:w-36 bg-white border border-slate-200/90 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-400 transition-all duration-200 group"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                <img
                  src={imgUrl}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discountPercent > 0 && (
                  <div className="absolute top-1 left-1 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                    ↓{product.discountPercent}%
                  </div>
                )}
              </div>

              {/* Text details */}
              <div className="text-left leading-tight">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h4>
                <p className="text-[10px] font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5">
                  {formatPrice(product.basePrice)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
