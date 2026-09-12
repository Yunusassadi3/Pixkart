"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { X, Sparkles, Smartphone, Headphones, Zap, Shield, Watch, Flame, ArrowRight, Tag, Heart, Scale } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import PixKartLogo from "@/components/common/PixKartLogo";

interface SidebarTab {
  id: string;
  name: string;
  image: string;
}

export default function MenuDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen, cartCount, brandsList } = useApp();
  const [activeTab, setActiveTab] = useState<string>("top-picks");

  if (!mobileMenuOpen) return null;

  const sidebarTabs: SidebarTab[] = [
    {
      id: "top-picks",
      name: "Top Picks",
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "mobiles",
      name: "Smartphones",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "earphones-tws",
      name: "Audio & TWS",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "chargers-powerbanks",
      name: "Chargers & Power",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "cases-covers",
      name: "Cases & Glass",
      image: "/images/back-covers-logo.png",
    },
    {
      id: "smartwatches",
      name: "Smartwatches",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "brands",
      name: "Shop Brands",
      image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: "deals",
      name: "Deals & Offers",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=80",
    },
  ];

  const handleClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
      {/* Background Overlay */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Main Drawer Container */}
      <div className="relative bg-white w-full h-[90vh] sm:h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

        {/* Top Sticky Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2">
            <PixKartLogo size="sm" theme="amber" />
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split View Body: Left Sidebar + Right Main Panel */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* LEFT VERTICAL SIDEBAR WITH REAL IMAGE LOGOS */}
          <div className="w-28 sm:w-32 bg-[#f8fafc] border-r border-slate-200/90 overflow-y-auto shrink-0 select-none no-scrollbar">
            {sidebarTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-3 px-2 flex flex-col items-center justify-center text-center transition-all border-b border-slate-200/60 relative ${isActive
                      ? "bg-white text-[#00838f] font-bold shadow-xs"
                      : "bg-[#f8fafc] text-slate-600 hover:bg-slate-100 font-medium"
                    }`}
                >
                  {/* Left Active Teal Indicator Line */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00838f] rounded-r-md" />
                  )}

                  {/* Real Image Logo Thumbnail */}
                  <div className={`w-8 h-8 rounded-full overflow-hidden mb-1 border transition-all ${isActive ? "border-[#00838f] ring-2 ring-[#00838f]/20 scale-105" : "border-slate-200 opacity-80"
                    }`}>
                    <img
                      src={tab.image}
                      alt={tab.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[11px] leading-tight font-sans tracking-tight">
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT CONTENT PANEL WITH REAL CATEGORY IMAGES */}
          <div className="flex-1 overflow-y-auto p-4 pb-28 bg-white no-scrollbar">

            {/* TOP PICKS GRID (WITH REAL PRODUCT IMAGES FOR EACH CATEGORY) */}
            {activeTab === "top-picks" && (
              <div className="space-y-6">

                {/* Section 1: Top Categories For You */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 tracking-wide border-b border-dashed border-slate-200 pb-1.5">
                    <span>Top Categories For You</span>
                  </div>

                  {/* 3-Column Grid with REAL Product Photos */}
                  <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.slug}`}
                        onClick={handleClose}
                        className="group flex flex-col items-center justify-center"
                      >
                        {/* Real Image Category Logo Box */}
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 group-hover:border-blue-500 shadow-xs group-hover:scale-105 transition-all relative">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5 line-clamp-2 group-hover:text-blue-600">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Section 2: Explore More */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 tracking-wide border-b border-dashed border-slate-200 pb-1.5">
                    <span>Explore More</span>
                  </div>

                  {/* 3-Column Feature Badges Grid */}
                  <div className="grid grid-cols-3 gap-y-5 gap-x-2 text-center">
                    <Link
                      href="/shop?sort=discount"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        🔥
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Live Deals
                      </span>
                    </Link>

                    <Link
                      href="/shop"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        🛡️
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Assured
                      </span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        👤
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Account
                      </span>
                    </Link>

                    <Link
                      href="/shop"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        🏷️
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Under ₹299
                      </span>
                    </Link>

                    <Link
                      href="/shop"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        💰
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Under ₹999
                      </span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={handleClose}
                      className="group flex flex-col items-center justify-center"
                    >
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                        ❤️
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-1.5">
                        Wishlist
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* BRAND SPECIFIC TAB CONTENT WITH BRAND IMAGES */}
            {activeTab === "brands" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-800 tracking-wide border-b border-dashed border-slate-200 pb-1.5">
                  <span>Shop By Smartphone Brand</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {brandsList.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/shop?brand=${brand.slug}`}
                      onClick={handleClose}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-blue-50 hover:border-blue-300 transition-all group"
                    >
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">
                        {brand.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORY SPECIFIC TAB CONTENT WITH REAL IMAGES */}
            {activeTab !== "top-picks" && activeTab !== "brands" && (
              <div className="space-y-4">
                {categories
                  .filter((cat) => cat.slug.includes(activeTab) || activeTab.includes(cat.slug) || activeTab === "deals")
                  .map((cat) => (
                    <div key={cat.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                          <p className="text-[11px] text-slate-500">{cat.tagline}</p>
                        </div>
                      </div>
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        onClick={handleClose}
                        className="w-full bg-[#2874f0] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        Browse All {cat.name} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}

                {/* Popular Collections */}
                <div className="pt-2 border-t border-dashed border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Popular Collections
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/shop"
                      onClick={handleClose}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      🔥 Bestsellers
                    </Link>
                    <Link
                      href="/shop?sort=price-low"
                      onClick={handleClose}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      💰 Budget Store
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM FLOATING ACTION PILL BUTTONS BAR */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md border border-slate-300 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2 pointer-events-auto">
            <Link
              href="/account#your-orders"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Orders
            </Link>

            <Link
              href="/account"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Account
            </Link>

            <Link
              href="/wishlist"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Wishlist
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
