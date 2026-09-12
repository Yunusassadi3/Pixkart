"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import BrandLogo from "@/components/icons/BrandLogos";
import { Smartphone, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function PhoneSelectorWidget() {
  const router = useRouter();
  const { selectedBrand, selectedModel, setSelectedDevice, brandsList, phoneModelsList } = useApp();

  const [localBrandId, setLocalBrandId] = useState(selectedBrand?.id || "apple");
  const [localModelId, setLocalModelId] = useState(selectedModel?.id || "iphone-16-pro-max");

  const availableModels = phoneModelsList.filter((m) => m.brandId === localBrandId);

  const handleBrandChange = (brandId: string) => {
    setLocalBrandId(brandId);
    const models = phoneModelsList.filter((m) => m.brandId === brandId);
    if (models.length > 0) {
      setLocalModelId(models[0].id);
    } else {
      setLocalModelId("");
    }
  };

  const handleApply = (categorySlug?: string) => {
    const brand = brandsList.find((b) => b.id === localBrandId) || null;
    const model = availableModels.find((m) => m.id === localModelId) || null;
    setSelectedDevice(brand, model);

    if (categorySlug) {
      router.push(`/shop?category=${categorySlug}`);
    } else {
      router.push("/shop");
    }
  };

  const mobileBrands = brandsList.filter(
    (b) => b.categoryType === "phone" || b.categoryType === "all"
  );

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1d4ed8] text-white p-3.5 sm:p-5 shadow-2xs border border-blue-400/30">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 relative z-10">
        <div>
          <span className="text-amber-300 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Precision Device Finder
          </span>
          <h2 className="text-sm sm:text-lg md:text-xl font-black text-white font-display leading-tight">
            Find Exact Accessories For Your Smartphone
          </h2>
        </div>
        <p className="text-[10px] sm:text-[11px] text-blue-100 hidden sm:block max-w-xs text-right leading-tight">
          100% precision-fit tempered glass, shockproof armor cases & chargers.
        </p>
      </div>

      {/* 1. Horizontal Scrollable Brand Tiles Rail */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center justify-between text-[10px] font-bold text-blue-100 mb-1 px-0.5">
          <span>1. SELECT BRAND ({mobileBrands.length} AVAILABLE):</span>
          <span className="text-[9px] text-amber-300 font-normal">Scroll to view all →</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 scroll-smooth snap-x">
          {mobileBrands.map((brand) => {
            const isSelected = localBrandId === brand.id;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleBrandChange(brand.id)}
                className={`w-[74px] sm:w-[84px] h-[58px] sm:h-[64px] shrink-0 snap-start rounded-xl p-1.5 flex flex-col items-center justify-between transition-all cursor-pointer relative group ${
                  isSelected
                    ? "bg-white text-slate-950 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md scale-102 z-10"
                    : "bg-white/95 hover:bg-white text-slate-900 border border-white/50 shadow-2xs hover:shadow-md"
                }`}
              >
                {/* Logo Frame */}
                <div className="h-6 sm:h-7 w-full flex items-center justify-center px-1">
                  <BrandLogo
                    brandId={brand.id}
                    logo={brand.logo}
                    name={brand.name}
                    className="h-5 sm:h-6 w-auto max-w-[85%] object-contain"
                  />
                </div>
                {/* Brand Name Text */}
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 truncate max-w-full text-center leading-none">
                  {brand.name}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className="w-2.5 h-2.5 fill-slate-950 text-amber-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Model Dropdown & Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-end relative z-10">
        <div className="sm:col-span-7 space-y-1">
          <label className="text-[10px] font-extrabold text-blue-100 block uppercase tracking-wider">
            2. SELECT PHONE MODEL:
          </label>
          <select
            value={localModelId}
            onChange={(e) => setLocalModelId(e.target.value)}
            className="w-full bg-white text-slate-900 border-2 border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer font-bold shadow-xs"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.series})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleApply("cases-covers")}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2 px-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <Smartphone className="w-3.5 h-3.5" /> Find Covers
          </button>
          <button
            onClick={() => handleApply("screen-protectors")}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-black text-xs py-2 px-2.5 rounded-xl border border-white/40 transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-102"
          >
            Find Glass <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

