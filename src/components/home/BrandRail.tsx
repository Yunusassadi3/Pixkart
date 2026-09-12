"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import BrandLogo from "@/components/icons/BrandLogos";
import { ShieldCheck, ArrowRight, Award } from "lucide-react";

export default function BrandRail() {
  const { brandsList } = useApp();
  const displayBrands = brandsList.filter(
    (b) => b.categoryType === "phone" || b.categoryType === "all"
  );

  return (
    <section className="py-14 px-4 sm:px-6 bg-[#f8fafc] border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">
                100% Genuine Partner Brands
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Explore Official Brand Stores
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 hidden md:inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Direct Manufacturer Warranty
            </span>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              View All Brands <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Ultra-Luxury Brand Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden h-36 sm:h-38"
            >
              {/* Subtle Ambient Hover Glow Accent */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${brand.color}15 0%, transparent 70%)`
                }}
              />

              {/* Logo Container - Transparent Background */}
              <div className="h-18 w-full flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300 z-10">
                <BrandLogo brandId={brand.id} logo={brand.logo} name={brand.name} className="h-12 sm:h-14 w-auto max-w-[88%] object-contain" />
              </div>

              {/* Brand Name & Official Badge */}
              <div className="flex flex-col items-center z-10">
                <span className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-full text-center font-sans">
                  {brand.name}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                  Official Store
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
