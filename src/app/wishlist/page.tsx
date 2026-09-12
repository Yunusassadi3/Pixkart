"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" /> My Saved Wishlist ({wishlist.length})
          </h1>
          <Link href="/shop" className="text-xs font-bold text-blue-600 hover:underline">
            Explore All Products
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="text-5xl">❤️</div>
            <h2 className="text-xl font-bold text-slate-900">Your Wishlist is Empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save your favorite smartphones, TWS earbuds, headphones, chargers, and cases to buy later.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#ff9f00] hover:bg-[#e68f00] text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow"
            >
              Browse PixKart Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
