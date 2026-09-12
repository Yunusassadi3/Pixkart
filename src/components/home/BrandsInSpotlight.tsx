"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function BrandsInSpotlight() {
  const { productsList, brandsList } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter products explicitly selected for "Brands in Spotlight" by the Admin
  const spotlightProducts = productsList ? productsList.filter((p) => p.inSpotlight) : [];

  if (spotlightProducts.length === 0) {
    return null;
  }

  const bgColors = [
    "bg-[#f5ede4] text-slate-900 border-orange-100",
    "bg-[#dbeafe] text-slate-900 border-blue-200",
    "bg-[#ede9fe] text-slate-900 border-purple-200",
    "bg-[#dcfce7] text-slate-900 border-emerald-200",
    "bg-[#fef9c3] text-slate-900 border-yellow-200",
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  return (
    <section className="px-3 sm:px-6 max-w-7xl mx-auto py-3">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-base sm:text-xl font-black text-slate-900 font-display tracking-tight">
          Brands in Spotlight
        </h2>

        {spotlightProducts.length > 3 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Side-Scrolling Rail */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {spotlightProducts.map((product, idx) => {
          const brandObj = brandsList.find((b) => b.id === product.brandId);
          const brandName = (brandObj?.name || product.brandId).toUpperCase();
          const cardBg = bgColors[idx % bgColors.length];
          const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";

          return (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className={`w-[160px] sm:w-[185px] md:w-[210px] shrink-0 snap-start rounded-2xl p-3 sm:p-4 border shadow-2xs flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] ${cardBg} group`}
            >
              {/* Top Header: Brand Name + % OFF / AD Badge */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 uppercase whitespace-nowrap">
                    {brandName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/10 text-slate-700 uppercase shrink-0">
                    {product.discountPercent > 0 ? `${product.discountPercent}% OFF` : "OFFICIAL"}
                  </span>
                </div>

                {/* Badge text (BESTSELLER / NEW ARRIVAL) fully visible on row 2 without cutoffs */}
                {product.badgeText && (
                  <div className="mt-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-orange-600 tracking-wider">
                      {product.badgeText}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Image Frame */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/70 mb-2.5 p-1.5 flex items-center justify-center shadow-2xs">
                <img
                  src={imgUrl}
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Price / Title at bottom */}
              <div className="text-center pt-0.5">
                <p className="text-xs sm:text-sm font-black truncate text-slate-950">
                  {formatPrice(product.basePrice)}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium truncate capitalize">
                  {product.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
