"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, Smartphone, ShoppingBag, Eye, Zap, Shield, Heart } from "lucide-react";

interface LogoItem {
  id: string;
  name: string;
  category: "ecommerce" | "minimalist" | "black-yellow" | "gradient" | "amazon";
  image: string;
  description: string;
  tag: string;
}

export default function LogoPreviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLogo, setActiveLogo] = useState<string>("pixkart_flipkart_style_1787965555767.jpg");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const logos: LogoItem[] = [
    {
      id: "V1",
      name: "Flipkart-Style Speed Bag",
      category: "ecommerce",
      image: "/images/logos/pixkart_flipkart_style_1787965555767.jpg",
      description: "Iconic royal blue & golden-yellow shopping bag with speed cutout 'P' and fast italic typography.",
      tag: "Top Recommended",
    },
    {
      id: "V2",
      name: "Lightning Bolt Blue Tote",
      category: "ecommerce",
      image: "/images/logos/pixkart_var_4_fast_tote_1787965832712.jpg",
      description: "Deep royal blue shopping tote sliced by a bold golden lightning bolt forming the letter 'P'.",
      tag: "High Energy",
    },
    {
      id: "V3",
      name: "Unboxing Phone Tote",
      category: "ecommerce",
      image: "/images/logos/pixkart_var_1_bag_phone_1787965767468.jpg",
      description: "Golden shopping bag with a royal blue smartphone and lightning spark popping out.",
      tag: "Clean & Friendly",
    },
    {
      id: "V4",
      name: "Italic 'P' Speed Cart",
      category: "ecommerce",
      image: "/images/logos/pixkart_var_2_p_cart_1787965790667.jpg",
      description: "Dynamic italic letter 'P' whose loop transforms into a shopping cart carrying a glowing phone.",
      tag: "Geometric",
    },
    {
      id: "V5",
      name: "Amazon-Style Classic Smile",
      category: "amazon",
      image: "/images/logos/pixkart_amazon_style_1787965597631.jpg",
      description: "Clean minimalist bold navy typography with a golden-orange smile arrow swooshing from 'p' to 't'.",
      tag: "Global Brand Aesthetic",
    },
    {
      id: "V6",
      name: "Spark Dot & Camera Smile",
      category: "amazon",
      image: "/images/logos/pixkart_var_3_smile_phone_1787965812265.jpg",
      description: "Bold black wordmark with a golden star dot over 'i' and a camera smile arc underneath.",
      tag: "Creative Wordmark",
    },
    {
      id: "V7",
      name: "Myntra Gradient Ribbon 'P'",
      category: "gradient",
      image: "/images/logos/pixkart_myntra_style_1787965617540.jpg",
      description: "Trendy overlapping geometric ribbon 'P' in sunset orange and electric magenta gradients.",
      tag: "Modern & Trendy",
    },
    {
      id: "V8",
      name: "Shopee Coral Shopping Bag",
      category: "ecommerce",
      image: "/images/logos/pixkart_shopee_style_1787965641532.jpg",
      description: "Friendly warm coral shopping bag with a clean white letter 'P' and lightning cutout.",
      tag: "Vibrant & Warm",
    },
    {
      id: "V9",
      name: "Snapdeal 3D Delivery Box",
      category: "ecommerce",
      image: "/images/logos/pixkart_snapdeal_style_1787965667065.jpg",
      description: "3D royal red & blue delivery parcel with a glowing smartphone and speed spark emerging.",
      tag: "3D Parcel",
    },
    {
      id: "V10",
      name: "Black & Yellow Speed Emblem",
      category: "black-yellow",
      image: "/images/logos/pixkart_black_yellow_logo_1787947044962.jpg",
      description: "Sleek black smartphone silhouette with golden speed trails and circular neon lighting.",
      tag: "Dark Mode Tech",
    },
    {
      id: "V11",
      name: "Power 'P' Monogram",
      category: "black-yellow",
      image: "/images/logos/pixkart_new_design_a_power_p_1787947596555.jpg",
      description: "Iconic matte black letter 'P' with a glowing yellow phone screen, lightning bolt, and cart wheels.",
      tag: "Bold Monogram",
    },
    {
      id: "V12",
      name: "Minimalist Monoline Cart & Star",
      category: "minimalist",
      image: "/images/logos/pixkart_new_design_b_monoline_1787947611522.jpg",
      description: "Clean thick line art of a smartphone sitting in a shopping cart with a radiant golden star.",
      tag: "Apple Aesthetic",
    },
    {
      id: "M1",
      name: "The SuperKart Express",
      category: "ecommerce",
      image: "/images/logos/pixkart_set_m1_superkart.jpg",
      description: "Flipkart/Blinkit fast shopping cart carrying a royal blue phone with white lightning and speed lines.",
      tag: "Express Store",
    },
    {
      id: "M2",
      name: "The Lightning 'P' Monogram",
      category: "minimalist",
      image: "/images/logos/pixkart_set_m2_lightning_p.jpg",
      description: "Bold geometric royal blue 'P' with an electric yellow lightning bolt and cart wheel base.",
      tag: "Clean Vector",
    },
    {
      id: "M3",
      name: "The Prime Smile Tote",
      category: "amazon",
      image: "/images/logos/pixkart_set_m3_smile_tote.jpg",
      description: "Amazon-inspired black tote bag with a golden smartphone and cheerful smile delivery arrow.",
      tag: "Smile Brand",
    },
    {
      id: "M4",
      name: "The Cyber Neon Octagon",
      category: "gradient",
      image: "/images/logos/pixkart_set_m4_cyber_neon.jpg",
      description: "Futuristic cyan and gold neon octagon badge with glowing smartphone and speed spark.",
      tag: "Cyber Tech",
    },
    {
      id: "M5",
      name: "Dynamic Multi-Ribbon 'P'",
      category: "gradient",
      image: "/images/logos/pixkart_set_m5_ribbon_p.jpg",
      description: "Myntra-style multi-color overlapping ribbon 'P' in magenta, orange, and yellow.",
      tag: "Style & Trend",
    },
    {
      id: "M6",
      name: "Unboxing Star Parcel",
      category: "ecommerce",
      image: "/images/logos/pixkart_set_m6_unboxing_star.jpg",
      description: "Snapdeal-inspired red & blue delivery parcel with a glowing smartphone and golden spark.",
      tag: "Parcel Box",
    },
    {
      id: "M10",
      name: "Minimalist Monoline Spark",
      category: "minimalist",
      image: "/images/logos/pixkart_set_m10_monoline_spark.jpg",
      description: "Apple-style ultra-clean black monoline phone in a shopping cart with 8-point golden star.",
      tag: "Ultra Minimal",
    }
  ];

  const filteredLogos = selectedCategory === "all"
    ? logos
    : logos.filter((l) => l.category === selectedCategory);

  const handleSelectLogo = (logo: LogoItem) => {
    setActiveLogo(logo.image);
    setCopiedId(logo.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Banner */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> PIXKART Brand Logo Design Studio
            </h1>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Click any logo to preview on live navbar mockups
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Live Navbar Mockup Simulator */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Interactive Simulator
              </span>
              <h2 className="text-lg font-black text-white">Live Storefront Header Preview</h2>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full w-fit">
              Currently testing: <strong className="text-amber-400">{logos.find(l => l.image === activeLogo)?.name || "Selected Logo"}</strong>
            </span>
          </div>

          {/* 1. PixKart Real Dark Blue Header Simulation */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">1. Main PixKart Navbar (Dark Sapphire Blue):</span>
            <div className="bg-[#172554] border border-blue-800/80 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                {/* Simulated Logo Emblem */}
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md bg-white p-1 flex items-center justify-center">
                  <img src={activeLogo} alt="Active Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <div className="bg-amber-400 text-slate-950 font-black text-xl px-2.5 py-0.5 rounded-lg italic tracking-wider">
                    <span>PIX</span><span className="text-blue-700">KART</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-300">
                    Mobile & Accessories
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs text-blue-100">
                <span className="bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-700/50">Search for phone cases, chargers...</span>
                <span className="font-bold text-amber-300">Cart (3)</span>
              </div>
            </div>
          </div>

          {/* 2. Light Theme Header Simulation */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">2. Clean Light Header / Mobile App Icon:</span>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md bg-slate-900 p-1 flex items-center justify-center">
                  <img src={activeLogo} alt="Active Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <div className="bg-slate-900 text-amber-400 font-black text-xl px-2.5 py-0.5 rounded-lg italic tracking-wider">
                    <span>PIX</span><span className="text-white">KART</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
                    Mobile & Accessories
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ✓ Cash on Delivery Available
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Choose Your Favorite Logo Design</h2>
            <span className="text-xs text-slate-400">{filteredLogos.length} Designs Available</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Designs" },
              { id: "ecommerce", label: "Flipkart & Ecommerce Styles" },
              { id: "amazon", label: "Amazon & Smile Styles" },
              { id: "black-yellow", label: "Black & Yellow Theme" },
              { id: "minimalist", label: "Apple Minimalist Line-Art" },
              { id: "gradient", label: "Myntra & Vibrant Gradients" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Logo Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLogos.map((logo) => {
            const isSelected = activeLogo === logo.image;
            return (
              <div
                key={logo.id}
                className={`bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-400/10 scale-[1.02]"
                    : "border-slate-800 hover:border-slate-700 hover:scale-[1.01]"
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {logo.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-full">
                      {logo.tag}
                    </span>
                  </div>

                  {/* Logo Image Preview Container */}
                  <div
                    onClick={() => handleSelectLogo(logo)}
                    className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-3 cursor-pointer group-hover:border-slate-700 transition-all"
                  >
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Preview on Header
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {logo.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {logo.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800">
                  <button
                    onClick={() => handleSelectLogo(logo)}
                    className={`w-full font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 shadow-md font-black"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" /> Active on Header Preview
                      </>
                    ) : (
                      "Select & Test on Header"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
