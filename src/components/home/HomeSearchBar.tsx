"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, Mic, QrCode } from "lucide-react";

export default function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="w-full bg-white px-3 sm:px-6 py-2.5 border-b border-slate-200 select-none">
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full bg-slate-100/90 hover:bg-slate-100 rounded-2xl border border-slate-300/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/20 overflow-hidden transition-all shadow-2xs"
        >
          {/* Search Icon */}
          <div className="pl-3.5 pr-1 text-slate-500">
            <Search className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>

          {/* Search Text Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Mobiles, Headphones, Chargers, Covers..."
            className="flex-1 bg-transparent py-2.5 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-500 font-medium"
          />

          {/* Camera, Voice Mic, and Search Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 pr-1.5 sm:pr-2">
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
              title="Search by Image"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
