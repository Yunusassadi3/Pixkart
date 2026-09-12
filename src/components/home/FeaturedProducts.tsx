"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/shop/ProductCard";
import { Sparkles } from "lucide-react";

export default function FeaturedProducts() {
  const { productsList } = useApp();
  const featured = productsList ? productsList.filter((p) => p.isFeatured) : [];

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-charcoal-light/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-gold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Demand Shielding
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            BEST-SELLER SELECTIONS
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
            Explore our most popular protection cases and screen shields, backed by thousands of reviews.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((prod) => (
            <div key={prod.id}>
              <ProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
