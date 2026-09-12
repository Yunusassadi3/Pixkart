"use client";

import React, { Suspense, useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/lib/data/products";
import { brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";
import BrandLogo from "@/components/icons/BrandLogos";
import CategoryIcon from "@/components/icons/CategoryIcon";
import { useApp } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X, Smartphone, Trash2, SlidersHorizontal, Star, ShieldCheck, Layers, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

function ShopContent() {
  const { selectedModel, setSelectedDevice, pincodeLocation, productsList, brandsList, categoriesList } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL parameters
  const qParam = searchParams.get("q") || "";
  const activeCategoryParam = searchParams.get("category") || "all";
  const activeBrandParam = searchParams.get("brand") || "all";
  const activeSortParam = searchParams.get("sort") || "featured";

  // Local filter states
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [pixkartAssuredOnly, setPixkartAssuredOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Search Query
      if (qParam) {
        const query = qParam.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = product.categoryId.toLowerCase().includes(query);
        const matchesBrand = product.brandId.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesBrand) return false;
      }

      // Category
      if (activeCategoryParam !== "all" && product.categoryId !== activeCategoryParam) {
        return false;
      }

      // Brand (supports single or comma-separated multiple brands)
      if (activeBrandParam !== "all") {
        const brandList = activeBrandParam.split(",");
        if (!brandList.includes(product.brandId)) {
          return false;
        }
      }

      // Rating
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }

      // Price
      if (product.basePrice > maxPrice) {
        return false;
      }

      // PixKart Assured
      if (pixkartAssuredOnly && !product.isPixKartAssured) {
        return false;
      }

      return true;
    });
  }, [qParam, activeCategoryParam, activeBrandParam, minRating, maxPrice, pixkartAssuredOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (activeSortParam === "price-low") {
      list.sort((a, b) => a.basePrice - b.basePrice);
    } else if (activeSortParam === "price-high") {
      list.sort((a, b) => b.basePrice - a.basePrice);
    } else if (activeSortParam === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSortParam === "discount") {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    }
    return list;
  }, [filteredProducts, activeSortParam]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSelectedDevice(null, null);
    setMinRating(0);
    setMaxPrice(200000);
    setPixkartAssuredOnly(false);
    setBrandSearchQuery("");
    setCategorySearchQuery("");
    router.push("/shop");
  };

  // Filter Tabs
  type FilterTab = "brand" | "category" | "price" | "rating" | "assured";
  const [activeTab, setActiveTab] = useState<FilterTab>("brand");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const filteredBrandsList = useMemo(() => {
    if (!brandSearchQuery.trim()) return brandsList;
    return brandsList.filter((b) =>
      b.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );
  }, [brandsList, brandSearchQuery]);

  const filteredCategoriesList = useMemo(() => {
    if (!categorySearchQuery.trim()) return categoriesList;
    return categoriesList.filter((c) =>
      c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  }, [categoriesList, categorySearchQuery]);

  const assuredParam = searchParams.get("assured") === "true";

  React.useEffect(() => {
    const handleOpenFilters = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent?.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
      setMobileFilterOpen(true);
    };
    window.addEventListener("open-pixkart-filters", handleOpenFilters);
    return () => window.removeEventListener("open-pixkart-filters", handleOpenFilters);
  }, []);

  const hasBrandFilter = activeBrandParam !== "all";
  const hasCategoryFilter = activeCategoryParam !== "all";
  const hasPriceFilter = maxPrice < 200000;
  const hasRatingFilter = minRating > 0;
  const hasAssuredFilter = pixkartAssuredOnly || assuredParam;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Header Breadcrumb & Results Banner */}
      <div className="bg-white border border-slate-200/80 p-3.5 sm:p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
            {qParam ? `Search Results for "${qParam}"` : "Mobiles & Accessories Store"}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Showing <span className="text-blue-600 font-bold">{sortedProducts.length}</span> items • Free delivery to {pincodeLocation}
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Desktop Sidebar 2-Pane Split Filter (Matching Reference Design) */}
        <aside className="hidden lg:block lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden sticky top-24">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Filters</h2>
            </div>
            <button
              onClick={handleClearAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>

          {/* Device Model Active Filter pill if any */}
          {selectedModel && (
            <div className="bg-emerald-50 px-3.5 py-2 border-b border-emerald-200 text-xs flex items-center justify-between">
              <span className="font-bold text-emerald-800 flex items-center gap-1 truncate text-[11px]">
                <Smartphone className="w-3 h-3 text-emerald-600 shrink-0" /> {selectedModel.name}
              </span>
              <button
                onClick={() => setSelectedDevice(null, null)}
                className="text-emerald-700 hover:text-red-600 p-0.5"
                title="Remove model filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2-Pane Container */}
          <div className="flex h-[520px]">
            {/* Left Column: Filter Category Tabs */}
            <div className="w-32 sm:w-36 bg-[#f1f3f6] border-r border-slate-200/80 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
              {[
                { id: "brand", label: "Brand", active: hasBrandFilter },
                { id: "category", label: "Category", active: hasCategoryFilter },
                { id: "price", label: "Price", active: hasPriceFilter },
                { id: "rating", label: "Rating", active: hasRatingFilter },
                { id: "assured", label: "Assured", active: hasAssuredFilter },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as FilterTab)}
                    className={`w-full text-left py-3.5 px-3 text-xs transition-all relative flex items-center justify-between cursor-pointer border-b border-slate-200/60 ${
                      isSelected
                        ? "bg-white font-bold text-blue-600 shadow-2xs"
                        : "text-slate-700 hover:bg-slate-200/60 font-medium"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}
                    <span className="truncate leading-none">{tab.label}</span>
                    {tab.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Filter Options */}
            <div className="flex-1 bg-white flex flex-col overflow-hidden">
              {/* BRAND TAB */}
              {activeTab === "brand" && (
                <div className="flex flex-col h-full">
                  <div className="p-2.5 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Search Brand"
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* All Brands Option */}
                    <label
                      onClick={() => updateParam("brand", "all")}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                        activeBrandParam === "all" ? "bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeBrandParam === "all"}
                        onChange={() => updateParam("brand", "all")}
                        className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">All Brands</span>
                    </label>

                    {filteredBrandsList.map((brand) => {
                      const isChecked = activeBrandParam === brand.id;
                      return (
                        <label
                          key={brand.id}
                          onClick={() => updateParam("brand", isChecked ? "all" : brand.id)}
                          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? "bg-blue-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => updateParam("brand", isChecked ? "all" : brand.id)}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                          />
                          <div className="w-5 h-5 bg-white rounded border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                            <BrandLogo
                              brandId={brand.id}
                              logo={brand.logo}
                              name={brand.name}
                              className="h-3.5 w-auto object-contain"
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-800 truncate">{brand.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY TAB */}
              {activeTab === "category" && (
                <div className="flex flex-col h-full">
                  <div className="p-2.5 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Search Category"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <label
                      onClick={() => updateParam("category", "all")}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                        activeCategoryParam === "all" ? "bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeCategoryParam === "all"}
                        onChange={() => updateParam("category", "all")}
                        className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-800">All Categories</span>
                    </label>

                    {filteredCategoriesList.map((cat) => {
                      const isChecked = activeCategoryParam === cat.id;
                      return (
                        <label
                          key={cat.id}
                          onClick={() => updateParam("category", isChecked ? "all" : cat.id)}
                          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? "bg-blue-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => updateParam("category", isChecked ? "all" : cat.id)}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                          />
                          <CategoryIcon categoryId={cat.id} active={isChecked} className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-medium text-slate-800 truncate">{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRICE TAB */}
              {activeTab === "price" && (
                <div className="p-3.5 space-y-4 overflow-y-auto h-full">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Max Budget</span>
                      <span className="text-xs font-black text-blue-600">{formatPrice(maxPrice)}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={160000}
                      step={500}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Quick Price Ranges
                    </span>
                    {[
                      { label: "Under ₹500", max: 500 },
                      { label: "Under ₹1,500", max: 1500 },
                      { label: "Under ₹5,000", max: 5000 },
                      { label: "Under ₹20,000", max: 20000 },
                      { label: "Any Price", max: 200000 },
                    ].map((p) => (
                      <label
                        key={p.max}
                        onClick={() => setMaxPrice(p.max)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          maxPrice === p.max ? "bg-blue-50/60" : "hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={maxPrice === p.max}
                          onChange={() => setMaxPrice(p.max)}
                          className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xs text-slate-800">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* RATING TAB */}
              {activeTab === "rating" && (
                <div className="p-3.5 space-y-2 overflow-y-auto h-full">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Minimum Rating
                  </span>
                  {[4, 3, 2].map((stars) => (
                    <label
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                        minRating === stars ? "bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={minRating === stars}
                        onChange={() => setMinRating(minRating === stars ? 0 : stars)}
                        className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-800">& Above</span>
                    </label>
                  ))}
                  <label
                    onClick={() => setMinRating(0)}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      minRating === 0 ? "bg-blue-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-800">All Ratings</span>
                  </label>
                </div>
              )}

              {/* ASSURED TAB */}
              {activeTab === "assured" && (
                <div className="p-3.5 space-y-3 overflow-y-auto h-full">
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={pixkartAssuredOnly}
                      onChange={(e) => setPixkartAssuredOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> PixKart Assured
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        100% Quality-tested genuine products with priority Udupi delivery.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Full-Screen Modal Filter (Exact 1:1 Flipkart Reference Layout) */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white w-full h-[90vh] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
              {/* Header: Back Arrow + Filters + Clear Filters */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex items-center gap-2 text-slate-900 font-bold text-sm cursor-pointer p-1"
                >
                  <X className="w-5 h-5 text-slate-700" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>

              {/* 2-Pane Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Tabs */}
                <div className="w-28 sm:w-36 bg-[#f1f3f6] border-r border-slate-200 flex flex-col overflow-y-auto no-scrollbar">
                  {[
                    { id: "brand", label: "Brand", active: hasBrandFilter },
                    { id: "category", label: "Category", active: hasCategoryFilter },
                    { id: "price", label: "Price", active: hasPriceFilter },
                    { id: "rating", label: "Rating", active: hasRatingFilter },
                    { id: "assured", label: "Assured", active: hasAssuredFilter },
                  ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as FilterTab)}
                        className={`w-full text-left py-4 px-3 text-xs transition-all relative flex items-center justify-between cursor-pointer border-b border-slate-200/60 ${
                          isSelected
                            ? "bg-white font-bold text-blue-600"
                            : "text-slate-700 font-medium"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                        )}
                        <span className="truncate">{tab.label}</span>
                        {tab.active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Content */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden">
                  {activeTab === "brand" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Search Brand"
                          value={brandSearchQuery}
                          onChange={(e) => setBrandSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <label
                          onClick={() => updateParam("brand", "all")}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={activeBrandParam === "all"}
                            onChange={() => updateParam("brand", "all")}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                          />
                          <span className="text-xs font-bold text-slate-800">All Brands</span>
                        </label>
                        {filteredBrandsList.map((brand) => {
                          const isChecked = activeBrandParam === brand.id;
                          return (
                            <label
                              key={brand.id}
                              onClick={() => updateParam("brand", isChecked ? "all" : brand.id)}
                              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => updateParam("brand", isChecked ? "all" : brand.id)}
                                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                              />
                              <span className="text-xs text-slate-800">{brand.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "category" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3 border-b border-slate-100">
                        <input
                          type="text"
                          placeholder="Search Category"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <label
                          onClick={() => updateParam("category", "all")}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={activeCategoryParam === "all"}
                            onChange={() => updateParam("category", "all")}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                          />
                          <span className="text-xs font-bold text-slate-800">All Categories</span>
                        </label>
                        {filteredCategoriesList.map((cat) => {
                          const isChecked = activeCategoryParam === cat.id;
                          return (
                            <label
                              key={cat.id}
                              onClick={() => updateParam("category", isChecked ? "all" : cat.id)}
                              className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => updateParam("category", isChecked ? "all" : cat.id)}
                                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                              />
                              <span className="text-xs text-slate-800">{cat.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === "price" && (
                    <div className="p-4 space-y-4 overflow-y-auto h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700">Max Budget</span>
                          <span className="text-xs font-black text-blue-600">{formatPrice(maxPrice)}</span>
                        </div>
                        <input
                          type="range"
                          min={100}
                          max={160000}
                          step={500}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div className="pt-2 space-y-2">
                        {[
                          { label: "Under ₹500", max: 500 },
                          { label: "Under ₹1,500", max: 1500 },
                          { label: "Under ₹5,000", max: 5000 },
                          { label: "Any Price", max: 200000 },
                        ].map((p) => (
                          <label
                            key={p.max}
                            onClick={() => setMaxPrice(p.max)}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={maxPrice === p.max}
                              onChange={() => setMaxPrice(p.max)}
                              className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                            />
                            <span className="text-xs text-slate-800">{p.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "rating" && (
                    <div className="p-4 space-y-2 overflow-y-auto h-full">
                      {[4, 3, 2].map((stars) => (
                        <label
                          key={stars}
                          onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={minRating === stars}
                            onChange={() => setMinRating(minRating === stars ? 0 : stars)}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                          />
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: stars }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs text-slate-800">& Above</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {activeTab === "assured" && (
                    <div className="p-4 space-y-3 overflow-y-auto h-full">
                      <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pixkartAssuredOnly}
                          onChange={(e) => setPixkartAssuredOnly(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 accent-blue-600 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">PixKart Assured Only</span>
                          <span className="text-[10px] text-slate-500">100% Quality-tested genuine products</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  Apply Filters ({sortedProducts.length} Products)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Catalog Grid */}
        <main className="lg:col-span-8 space-y-6">
          {sortedProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="text-4xl">🔍</div>
              <h3 className="text-xl font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search terms or clearing category and brand filters.
              </p>
              <button
                onClick={handleClearAll}
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading PixKart Store...</div>}>
          <ShopContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
