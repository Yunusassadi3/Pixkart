"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Search, X, Laptop, ShieldCheck, ChevronRight, Smartphone } from "lucide-react";
import { phoneModels, PhoneModel } from "@/lib/data/models";
import { brands } from "@/lib/data/brands";
import { products, Product } from "@/lib/data/products";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fuzzyMatch } from "@/lib/utils";

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSelectedDevice, productsList, brandsList, phoneModelsList } = useApp();
  const [query, setQuery] = useState("");
  const [modelResults, setModelResults] = useState<PhoneModel[]>([]);
  const [productResults, setProductResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setModelResults([]);
      setProductResults([]);
    }
  }, [searchOpen]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setModelResults([]);
      setProductResults([]);
      return;
    }

    // Fuzzy match phone models
    const matchedModels = phoneModelsList.filter((m) => {
      const brand = brandsList.find((b) => b.id === m.brandId)?.name || "";
      const textToSearch = `${brand} ${m.name} ${m.series}`;
      return fuzzyMatch(val, textToSearch);
    });

    // Fuzzy match products
    const matchedProducts = productsList.filter((p) => {
      return fuzzyMatch(val, p.title) || fuzzyMatch(val, p.description);
    });

    setModelResults(matchedModels.slice(0, 5));
    setProductResults(matchedProducts.slice(0, 5));
  };

  const selectDeviceModel = (model: PhoneModel) => {
    const brand = brandsList.find((b) => b.id === model.brandId) || null;
    setSelectedDevice(brand, model);
    setSearchOpen(false);
    router.push(`/shop?brand=${model.brandId}&model=${model.slug}`);
  };

  const selectProduct = (product: Product) => {
    setSearchOpen(false);
    router.push(`/shop/${product.slug}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-charcoal/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <span className="text-xl font-display font-extrabold tracking-wider bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
              PIXKART SEARCH
            </span>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Box */}
          <div className="max-w-3xl w-full mx-auto px-6 pt-12 pb-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search phone models (e.g. 'iPhone 15 Pro Max', 's24 ultra')..."
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 text-lg transition-all duration-300"
              />
            </div>
            {query && modelResults.length === 0 && productResults.length === 0 && (
              <p className="mt-4 text-center text-gray-400 text-sm">
                No results found for &ldquo;{query}&rdquo;. Try another search.
              </p>
            )}
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Models column */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Compatible Models
                </h3>
                {modelResults.length > 0 ? (
                  <div className="space-y-2">
                    {modelResults.map((model) => {
                      const brand = brands.find((b) => b.id === model.brandId);
                      return (
                        <button
                          key={model.id}
                          onClick={() => selectDeviceModel(model)}
                          className="w-full text-left p-3 rounded-xl bg-white/3 hover:bg-white/10 border border-white/5 hover:border-gold/20 flex items-center justify-between group transition-all duration-200"
                        >
                          <div>
                            <p className="text-white font-medium group-hover:text-gold transition-colors">
                              {model.name}
                            </p>
                            <p className="text-xs text-gray-400">{brand?.name || "Generic"}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/1 text-xs text-gray-500">
                    {query ? "No models matched." : "Type your phone model (e.g. 'OnePlus 12', 'Pixel 9')."}
                  </div>
                )}
              </div>

              {/* Products column */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-light mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Accessories
                </h3>
                {productResults.length > 0 ? (
                  <div className="space-y-2">
                    {productResults.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => selectProduct(prod)}
                        className="w-full text-left p-3 rounded-xl bg-white/3 hover:bg-white/10 border border-white/5 hover:border-emerald/40 flex items-center justify-between group transition-all duration-200"
                      >
                        <div>
                          <p className="text-white font-medium group-hover:text-emerald-glow transition-colors">
                            {prod.title}
                          </p>
                          <p className="text-xs text-emerald-light">₹{prod.basePrice}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/1 text-xs text-gray-500">
                    {query ? "No accessories matched." : "Search screen guards, matte protectors, back covers."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
