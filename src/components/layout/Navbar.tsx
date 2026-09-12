"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useApp, UDUPI_UNDELIVERABLE_MESSAGE } from "@/context/AppContext";
import {
  Search,
  ShoppingCart,
  Heart,
  MapPin,
  ChevronDown,
  Smartphone,
  X,
  Menu,
  Truck,
  User,
  SlidersHorizontal,
  ShieldCheck,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { categories } from "@/lib/data/categories";
import PixKartLogo from "@/components/common/PixKartLogo";

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBrowsingProducts = pathname.startsWith("/shop");

  const {
    cartCount,
    cartTotal,
    wishlist,
    pincodeLocation,
    setPincode,
    pincode,
    selectedModel,
    setSelectedDevice,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    brandsList,
    categoriesList,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(pincode || "");
  const [activeOpenMenu, setActiveOpenMenu] = useState<"sort" | "brand" | "category" | null>(null);
  const [brandSearchMenu, setBrandSearchMenu] = useState("");
  const [selectedBrandCheckboxes, setSelectedBrandCheckboxes] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selectedBrandCheckboxes with current URL param
  React.useEffect(() => {
    const brandParam = searchParams?.get("brand");
    if (brandParam && brandParam !== "all") {
      setSelectedBrandCheckboxes(brandParam.split(","));
    } else {
      setSelectedBrandCheckboxes([]);
    }
  }, [searchParams]);

  const activeUser = mounted ? user : null;
  const activeWishlist = mounted ? wishlist : [];
  const activeCartCount = mounted ? cartCount : 0;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() && searchCategory === "all") return;
    let url = `/shop?q=${encodeURIComponent(searchQuery)}`;
    if (searchCategory !== "all") {
      url += `&category=${searchCategory}`;
    }
    router.push(url);
  };

  const [modalPincodeError, setModalPincodeError] = useState<string | null>(null);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pincodeInput.trim();
    if (!pin) {
      setModalPincodeError("Please enter your 6-digit delivery pincode.");
      return;
    }
    if (pin.length !== 6) {
      setModalPincodeError("Please enter a valid 6-digit Indian Pincode.");
      return;
    }
    const isValid = setPincode(pin);
    if (isValid) {
      setModalPincodeError(null);
      setPincodeModalOpen(false);
    } else {
      setModalPincodeError(UDUPI_UNDELIVERABLE_MESSAGE);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2874f0] text-white shadow-xl select-none">
      {/* Main Clean Header Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo Flush at Left Corner (3-lines hamburger removed on mobile) */}
        <Link href="/" className="flex items-center shrink-0">
          <PixKartLogo size="md" showTagline={true} theme="amber" />
        </Link>

        {/* Deliver To Pincode Location Selector (Desktop) */}
        <button
          onClick={() => setPincodeModalOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-white/10 transition-all text-left shrink-0"
        >
          <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="text-xs leading-tight">
            <span className="text-blue-100 block text-[10px]">Deliver to</span>
            <span className="font-bold text-white flex items-center gap-1">
              {pincodeLocation} <ChevronDown className="w-3 h-3 text-blue-200" />
            </span>
          </div>
        </button>

        {/* Main Search Bar (Desktop & Tablet) */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden sm:flex items-center">
          <div className="flex w-full rounded-md overflow-hidden bg-white text-black focus-within:ring-2 focus-within:ring-amber-400 shadow-md">
            {/* Category Select Dropdown */}
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-gray-100 text-gray-700 text-xs px-2 py-2.5 border-r border-gray-300 outline-none cursor-pointer hover:bg-gray-200"
            >
              <option value="all">All Products</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mobiles, Headphones, 65W Chargers, Covers..."
              className="w-full text-sm px-3 py-2 text-black outline-none placeholder:text-gray-400"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-black px-4 flex items-center justify-center transition-colors font-bold"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Right Quick Action Badges (Properly Adjusted for Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Active Device Filter Badge (Desktop) */}
          {selectedModel && (
            <div className="hidden xl:flex items-center gap-1.5 bg-[#1d4ed8] px-2.5 py-1 rounded border border-amber-300/40 text-xs">
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white font-medium truncate max-w-[110px]">
                {selectedModel.name}
              </span>
              <button
                onClick={() => setSelectedDevice(null, null)}
                className="hover:text-red-300 p-0.5 ml-1"
                title="Clear device filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Desktop Track Order Button in Main Top Bar */}
          <Link
            href="/track"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs"
            title="Track Order Live"
          >
            <Truck className="w-5 h-5 text-amber-300" />
            <div className="text-left text-xs leading-tight">
              <span className="text-blue-100 block text-[10px]">Live Status</span>
              <span className="font-bold text-white block">Track Order</span>
            </div>
          </Link>

          {/* Desktop User Account / Sign In Link */}
          <Link
            href={activeUser ? "/account" : "/signin"}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs"
            title={activeUser ? "My Account" : "Sign In with Google"}
          >
            {activeUser?.avatar ? (
              <img src={activeUser.avatar} alt={activeUser.name} className="w-6 h-6 rounded-full border border-amber-300 object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                {activeUser ? activeUser.name.charAt(0) : "G"}
              </div>
            )}
            <div className="text-left text-xs leading-tight">
              <span className="text-blue-100 block text-[10px]">{activeUser ? "Hello," : "Sign In"}</span>
              <span className="font-bold text-white max-w-[90px] truncate block">
                {activeUser ? activeUser.name : "Account"}
              </span>
            </div>
          </Link>

          {/* 1. Mobile View: "Track Order" placed after PixKart and before Sign In */}
          <Link
            href="/track"
            className="sm:hidden flex items-center gap-1 bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-300/40 px-2 py-1 rounded-full text-[11px] font-bold shadow-xs transition-all shrink-0"
            title="Track Order"
          >
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span className="whitespace-nowrap">Track Order</span>
          </Link>

          {/* 2. Mobile View: Sign In / Account button */}
          <Link
            href={activeUser ? "/account" : "/signin"}
            className="sm:hidden flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-[11px] font-black shadow-xs transition-all shrink-0"
            title={activeUser ? "My Account" : "Sign In with Google"}
          >
            {activeUser?.avatar ? (
              <img src={activeUser.avatar} alt={activeUser.name} className="w-3.5 h-3.5 rounded-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
            <span className="truncate max-w-[65px]">
              {activeUser ? activeUser.name.split(" ")[0] : "Sign In"}
            </span>
          </Link>

          {/* Wishlist Link (Desktop) */}
          <Link
            href="/wishlist"
            className="hidden sm:flex items-center gap-1 text-white hover:text-amber-300 relative p-1.5"
            title="Wishlist"
          >
            <Heart className="w-6 h-6" />
            {activeWishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeWishlist.length}
              </span>
            )}
            <span className="hidden lg:inline text-xs font-semibold ml-1">Wishlist</span>
          </Link>

          {/* Cart Icon & Price (Mobile & Desktop) */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-[#1d4ed8] hover:bg-[#1e3a8a] px-2 sm:px-3 py-1.5 rounded-lg border border-white/20 hover:border-amber-300 transition-all text-white shadow shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {activeCartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-amber-400 text-slate-950 text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {activeCartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="text-blue-200 block text-[10px]">Cart</span>
              <span className="font-bold font-mono text-amber-300 block">
                {formatPrice(cartTotal)}
              </span>
            </div>
          </Link>

        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="sm:hidden px-3 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="flex w-full rounded-md overflow-hidden bg-white text-black">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Mobiles, Headphones, Chargers..."
            className="w-full text-xs px-3 py-2 text-black outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="bg-amber-400 text-black px-3 flex items-center justify-center font-bold"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Blue Sub-Bar (All Categories on Home page, Filter Pills on Shop/Browsing routes) */}
      <div className="bg-[#1e40af] border-t border-white/15 py-1.5 px-3 sm:px-6 select-none relative z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
          {!isBrowsingProducts ? (
            /* Home Page / Non-Browsing: Only All Categories */
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition-colors active:scale-95"
              title="View All Categories & Products"
            >
              <Menu className="w-4 h-4 text-amber-300" />
              <span className="whitespace-nowrap">All Categories</span>
            </Link>
          ) : (
            /* Browsing / Searching Products (/shop): ONLY the Filter Pills without All Categories beside them */
            <div className="flex items-center gap-2 w-full">
              {/* 1. Sort Button & Dropdown Table */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveOpenMenu(activeOpenMenu === "sort" ? null : "sort")}
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    searchParams?.get("sort") && searchParams.get("sort") !== "featured"
                      ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                      : "bg-white hover:bg-slate-50 text-slate-900 border-white/40"
                  }`}
                >
                  <span>Sort</span>
                  <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${activeOpenMenu === "sort" ? "rotate-180" : ""}`} />
                </button>

              {activeOpenMenu === "sort" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveOpenMenu(null)} />
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sort Options</span>
                      <span className="text-[10px] text-blue-600 font-bold">Quick Select</span>
                    </div>
                    <div className="p-1.5 divide-y divide-slate-100/60">
                      {[
                        { id: "featured", label: "Featured / Popular" },
                        { id: "price-low", label: "Price: Low to High" },
                        { id: "price-high", label: "Price: High to Low" },
                        { id: "rating", label: "Highest Rating (4★+)" },
                        { id: "discount", label: "Discount % (Highest)" },
                      ].map((opt) => {
                        const isSelected = (searchParams?.get("sort") || "featured") === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              updateParam("sort", opt.id);
                              setActiveOpenMenu(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "text-blue-700 font-bold bg-blue-50/80"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. Filter Button */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-pixkart-filters"));
                }
              }}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-900 border border-white/40 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>Filter</span>
              <SlidersHorizontal className="w-3 h-3 text-slate-700 shrink-0" />
            </button>

            {/* 3. Brand Button & Dropdown Table */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (activeOpenMenu !== "brand") {
                    const brandParam = searchParams?.get("brand");
                    if (brandParam && brandParam !== "all") {
                      setSelectedBrandCheckboxes(brandParam.split(","));
                    } else {
                      setSelectedBrandCheckboxes([]);
                    }
                  }
                  setActiveOpenMenu(activeOpenMenu === "brand" ? null : "brand");
                }}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  searchParams?.get("brand") && searchParams.get("brand") !== "all"
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                    : "bg-white hover:bg-slate-50 text-slate-900 border-white/40"
                }`}
              >
                <span>Brand</span>
                {selectedBrandCheckboxes.length > 0 && (
                  <span className="bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {selectedBrandCheckboxes.length}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${activeOpenMenu === "brand" ? "rotate-180" : ""}`} />
              </button>

              {activeOpenMenu === "brand" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveOpenMenu(null)} />
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Brands</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBrandCheckboxes([])}
                        className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search brands (e.g. Apple, Samsung)..."
                      value={brandSearchMenu}
                      onChange={(e) => setBrandSearchMenu(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none mb-2 focus:bg-white focus:border-blue-500 text-slate-900"
                      autoFocus
                    />

                    {/* Checkbox Brands 2-Column Grid */}
                    <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1 py-1">
                      {brandsList
                        .filter((b) => !brandSearchMenu || b.name.toLowerCase().includes(brandSearchMenu.toLowerCase()))
                        .map((b) => {
                          const isChecked = selectedBrandCheckboxes.includes(b.id);
                          return (
                            <label
                              key={b.id}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                isChecked
                                  ? "bg-blue-50/90 text-blue-800 border-blue-300 font-bold shadow-2xs"
                                  : "bg-slate-50/50 hover:bg-slate-100/80 text-slate-700 border-slate-200/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedBrandCheckboxes(selectedBrandCheckboxes.filter((id) => id !== b.id));
                                  } else {
                                    setSelectedBrandCheckboxes([...selectedBrandCheckboxes, b.id]);
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 cursor-pointer"
                              />
                              <span className="text-xs truncate">{b.name}</span>
                            </label>
                          );
                        })}
                    </div>

                    {/* Bottom Action Bar with Confirm Button */}
                    <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrandCheckboxes([]);
                          updateParam("brand", "all");
                          setActiveOpenMenu(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (selectedBrandCheckboxes.length === 0) {
                            updateParam("brand", "all");
                          } else {
                            updateParam("brand", selectedBrandCheckboxes.join(","));
                          }
                          setActiveOpenMenu(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <span>Confirm</span>
                        {selectedBrandCheckboxes.length > 0 && (
                          <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                            {selectedBrandCheckboxes.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. Category Button & Dropdown Table */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveOpenMenu(activeOpenMenu === "category" ? null : "category")}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  searchParams?.get("category") && searchParams.get("category") !== "all"
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                    : "bg-white hover:bg-slate-50 text-slate-900 border-white/40"
                }`}
              >
                <span>Category</span>
                <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${activeOpenMenu === "category" ? "rotate-180" : ""}`} />
              </button>

              {activeOpenMenu === "category" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveOpenMenu(null)} />
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Category</span>
                      <button
                        type="button"
                        onClick={() => {
                          updateParam("category", "all");
                          setActiveOpenMenu(null);
                        }}
                        className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Reset to All
                      </button>
                    </div>

                    {/* 2-Column Categories Table */}
                    <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-1 pr-1">
                      <button
                        type="button"
                        onClick={() => {
                          updateParam("category", "all");
                          setActiveOpenMenu(null);
                        }}
                        className={`col-span-2 text-left px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                          (searchParams?.get("category") || "all") === "all"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-transparent"
                        }`}
                      >
                        <span>All Categories</span>
                        {(searchParams?.get("category") || "all") === "all" && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                      </button>

                      {categoriesList.map((c) => {
                        const isSelected = searchParams?.get("category") === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              updateParam("category", c.id);
                              setActiveOpenMenu(null);
                            }}
                            className={`text-left px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold border-blue-200 shadow-2xs"
                                : "hover:bg-slate-50 text-slate-700 border-slate-100"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-blue-600 stroke-[3] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 5. PixKart Assured Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const current = searchParams ? searchParams.get("assured") : null;
                updateParam("assured", current === "true" ? "all" : "true");
              }}
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                searchParams && searchParams.get("assured") === "true"
                  ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                  : "bg-white hover:bg-slate-50 text-slate-900 border-white/40"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Assured</span>
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Pincode Modal */}
      {pincodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
                <MapPin className="w-5 h-5" /> Choose your delivery location
              </h3>
              <button onClick={() => setPincodeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Enter your 6-digit delivery pincode to check deliverability and order eligibility.
            </p>

            {modalPincodeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl mb-3">
                {modalPincodeError}
              </div>
            )}

            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Indian Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
              >
                Apply Delivery Location
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 w-full bg-[#2874f0] h-16 shadow-xl" />}>
      <NavbarContent />
    </Suspense>
  );
}
