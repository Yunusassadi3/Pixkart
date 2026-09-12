"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Layers, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 flex items-center gap-2">
              <Layers className="w-7 h-7 text-blue-600" /> Compare Mobiles & Specs ({compareList.length}/4)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side technical specs, prices, ratings, and features matrix.
            </p>
          </div>
          {compareList.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs text-red-500 hover:underline font-bold border border-red-300 px-3 py-1.5 rounded-lg"
            >
              Clear Comparison Matrix
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="text-5xl">⚖️</div>
            <h2 className="text-xl font-bold text-slate-900">No Products Selected for Comparison</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the layer icon (⚖️) on any smartphone, earphones, or accessory card to add it to this side-by-side comparison matrix.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#ff9f00] hover:bg-[#e68f00] text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow"
            >
              Browse PixKart Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-slate-500 font-bold w-1/5">Product Info</th>
                  {compareList.map((product) => (
                    <th key={product.id} className="p-3 text-slate-900 align-top w-1/4">
                      <div className="space-y-2 relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-0 right-0 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img
                          src={product.imageUrls[0]}
                          alt={product.title}
                          className="w-24 h-24 object-cover rounded-xl border border-slate-200 bg-slate-50"
                        />
                        <Link href={`/shop/${product.slug}`} className="block hover:text-blue-600 font-bold line-clamp-2">
                          {product.title}
                        </Link>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-full bg-[#ff9f00] hover:bg-[#e68f00] text-slate-950 font-black text-[11px] py-2 rounded-lg flex items-center justify-center gap-1 shadow"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Price Row */}
                <tr>
                  <td className="p-3 text-slate-500 font-bold bg-slate-50">Offer Price</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-3 font-mono font-black text-sm text-blue-600">
                      {formatPrice(product.basePrice)}
                      {product.mrp > product.basePrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          MRP {formatPrice(product.mrp)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="p-3 text-slate-500 font-bold bg-slate-50">Customer Rating</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-3">
                      <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                        {product.rating} ★ ({product.reviewCount})
                      </span>
                    </td>
                  ))}
                </tr>

                {/* PixKart Assured */}
                <tr>
                  <td className="p-3 text-slate-500 font-bold bg-slate-50">PixKart Guarantee</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-3 text-emerald-700 font-bold">
                      {product.isPixKartAssured ? "✓ PixKart Assured" : "Standard Warranty"}
                    </td>
                  ))}
                </tr>

                {/* Specifications Rows */}
                {["Display", "Processor", "Camera", "Battery", "Charging", "Material"].map((specKey) => (
                  <tr key={specKey}>
                    <td className="p-3 text-slate-500 font-bold bg-slate-50">{specKey}</td>
                    {compareList.map((product) => (
                      <td key={product.id} className="p-3 text-slate-800">
                        {product.specs[specKey] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
