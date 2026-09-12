"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import PixKartLogo from "@/components/common/PixKartLogo";

export default function Footer() {
  const { categoriesList } = useApp();
  return (
    <footer className="bg-[#172554] text-blue-100 text-xs border-t border-blue-800">
      {/* Back to top banner */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[#1d4ed8] hover:bg-[#1e3a8a] text-white font-bold py-3.5 text-center transition-colors text-xs border-b border-blue-400/20 shadow-inner"
      >
        Back to top ▲
      </button>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <PixKartLogo size="lg" theme="amber" />
          </div>
          <p className="text-blue-100 text-xs leading-relaxed max-w-sm">
            Udupi's #1 destination for 5G smartphones, wireless ANC earphones, studio headphones, 120W GaN fast chargers, 9H tempered glass, and military armor back covers.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-blue-100 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% PixKart Verified
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <Truck className="w-4 h-4" /> Delivery Across Udupi City
            </span>
            <span className="flex items-center gap-1.5 text-xs text-blue-200 font-bold">
              <RefreshCw className="w-4 h-4" /> No Return, Only Exchange
            </span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Top Categories</h4>
          <ul className="space-y-2">
            {categoriesList.slice(0, 8).map((cat) => (
              <li key={cat.id}>
                <Link href={`/shop?category=${cat.slug}`} className="text-blue-200 hover:text-amber-300 transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Customer Care</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/track" className="text-amber-300 hover:text-white font-bold transition-colors flex items-center gap-1">
                <span>🚚 Track Order Live</span>
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-blue-200 hover:text-amber-300 transition-colors">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="text-blue-200 hover:text-amber-300 transition-colors">
                My Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Payment Methods & Security */}
        <div>
          <h4 className="text-white font-bold text-sm mb-3">Payment Modes</h4>
          <p className="text-blue-100 text-xs mb-3">
            Cash on Delivery (COD) accepted exclusively across Udupi City & Manipal.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="bg-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-400 text-white font-bold shadow-xs">
              💵 Cash on Delivery (COD)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-[#0e1738] py-6 px-4 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-blue-300">
          <p>© {new Date().getFullYear()} PIXKART India Retail Ltd. Exclusively Serving Udupi City.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
