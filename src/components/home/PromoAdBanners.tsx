"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function PromoAdBanners() {
  const { productsList, brandsList } = useApp();

  // Filter products explicitly selected for "Promo Ad Banners" by the Admin
  const promoProducts = productsList ? productsList.filter((p) => p.inPromoBanner) : [];

  if (promoProducts.length === 0) {
    return null;
  }

  const bgGradients = [
    "bg-[#18181b] text-white border-zinc-800",
    "bg-[#2e1065] text-white border-purple-900",
    "bg-[#090d16] text-white border-blue-950",
    "bg-[#064e3b] text-white border-emerald-900",
  ];

  return (
    <section className="px-3 sm:px-6 max-w-7xl mx-auto py-1.5">
      <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {promoProducts.map((product, idx) => {
          const brandObj = brandsList.find((b) => b.id === product.brandId);
          const brandName = (brandObj?.name || product.brandId).toUpperCase();
          const cardBg = bgGradients[idx % bgGradients.length];
          const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";

          return (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className={`flex-shrink-0 w-[78vw] sm:w-[340px] md:w-[370px] rounded-2xl p-3.5 sm:p-4 border shadow-md flex items-center justify-between transition-all duration-200 hover:scale-[1.01] ${cardBg} group relative overflow-hidden`}
            >
              {/* Left Content */}
              <div className="space-y-1 z-10 max-w-[62%] sm:max-w-[58%]">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-400 text-black">
                    {brandName}
                  </span>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                    {product.discountPercent > 0 ? `${product.discountPercent}% OFF` : product.badgeText || "DEALS"}
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm md:text-base font-black font-display tracking-tight leading-snug uppercase line-clamp-1">
                  {product.title}
                </h3>

                <p className="text-[10px] text-white/70 font-medium line-clamp-1">
                  {product.description || "Official Genuine Mobile Accessory"}
                </p>

                <div className="pt-1">
                  <p className="text-xs sm:text-sm font-black text-white">
                    {formatPrice(product.basePrice)}
                    {product.mrp > product.basePrice && (
                      <span className="text-[10px] text-white/50 line-through ml-1.5 font-normal">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Image Frame */}
              <div className="relative w-20 sm:w-28 md:w-32 aspect-[4/3] rounded-xl overflow-hidden bg-black/30 border border-white/10 shadow-inner flex items-center justify-center shrink-0 p-1">
                <img
                  src={imgUrl}
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
