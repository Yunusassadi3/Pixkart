"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { useApp } from "@/context/AppContext";
import { Flame, Clock, ArrowRight } from "lucide-react";

export default function DealsSection() {
  const { productsList } = useApp();
  const dealProducts = productsList ? productsList.filter((p) => p.isDealOfDay) : [];

  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!dealProducts || dealProducts.length === 0) {
    return null;
  }

  return (
    <section id="deals-section" className="py-8 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Deal Header with Live Timer */}
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  FLASH DEALS
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                  Featured Mobile Accessories
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trending Accessories for Apple, Samsung, OnePlus, Pixel & Xiaomi
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-blue-900">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Fast Shipping Ends In:</span>
            <div className="flex items-center gap-1 font-mono text-xs text-blue-700 font-black">
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              :
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              :
              <span className="bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {dealProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            View All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
