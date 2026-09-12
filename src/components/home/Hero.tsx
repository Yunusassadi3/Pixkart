"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck, Tag, Sparkles, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";

export default function Hero() {
  const { productsList, brandsList } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter products explicitly selected for "Top Hero Banner Slider"
  const heroProducts = productsList ? productsList.filter((p) => p.inHeroBanner) : [];
  const activeProductSlides = heroProducts;
  const totalSlides = activeProductSlides.length;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(timer);
  }, [totalSlides]);

  if (activeProductSlides.length === 0) {
    return null;
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const gradients = [
    "from-[#d1e5fc] via-[#e2eefb] to-[#f2f8ff]",
    "from-[#fed7aa]/70 via-[#ffedd5] to-[#fff7ed]",
    "from-[#e0e7ff] via-[#ede9fe] to-[#faf5ff]",
    "from-[#dcfce7] via-[#f0fdf4] to-[#f8fafc]",
  ];

  const currentProduct = activeProductSlides[currentSlide % activeProductSlides.length];
  const brandObj = brandsList.find((b) => b.id === currentProduct.brandId);
  const currentGradient = gradients[currentSlide % gradients.length];
  const mainImage = currentProduct.imageUrls?.[0] || "/images/placeholder.png";

  return (
    <section className="bg-white py-3 px-3 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto">
        <div
          className={`relative rounded-3xl overflow-hidden shadow-2xs border border-slate-200/80 bg-gradient-to-r ${currentGradient} transition-all duration-700 group`}
        >
          <Link href={`/shop/${currentProduct.slug}`} className="block relative">
            <div className="min-h-[170px] sm:min-h-[220px] md:min-h-[260px] p-4 sm:p-6 md:p-8 flex items-center justify-between">
              <div className="space-y-1.5 z-10 max-w-[62%] sm:max-w-[60%]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-wider">
                    {brandObj?.name || currentProduct.brandId}
                  </span>
                  <span className="text-slate-400 text-xs">|</span>
                  <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs text-[10px] sm:text-xs font-bold text-blue-700">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>{currentProduct.badgeText || "PixKart Genuine"}</span>
                  </div>
                  {currentProduct.discountPercent > 0 && (
                    <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase shadow-2xs flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {currentProduct.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight line-clamp-2">
                  {currentProduct.title}
                </h2>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-3xl font-black text-slate-950">
                    {formatPrice(currentProduct.basePrice)}
                  </span>
                  {currentProduct.mrp > currentProduct.basePrice && (
                    <span className="text-xs sm:text-base text-slate-400 line-through font-semibold">
                      {formatPrice(currentProduct.mrp)}
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-xs font-bold text-emerald-700">
                  ✓ Available in Udupi & Manipal (Cash on Delivery)
                </p>
              </div>

              <div className="relative flex items-center justify-end z-10 shrink-0 h-full">
                <div className="relative w-28 sm:w-44 aspect-square rounded-2xl overflow-hidden bg-white/90 border border-white/60 shadow-lg p-2 flex items-center justify-center">
                  <img
                    src={mainImage}
                    alt={currentProduct.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Link>

          {totalSlides > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  prevSlide();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md z-20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  nextSlide();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md z-20 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {activeProductSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentSlide === i ? "w-6 bg-slate-900" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
