"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function CategoryBar() {
  const { categoriesList } = useApp();

  return (
    <section className="bg-white border-b border-slate-200 py-1.5 sm:py-2 px-3 sm:px-6 select-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2.5 sm:gap-5 overflow-x-auto no-scrollbar pb-0.5">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center gap-1 min-w-[62px] sm:min-w-[76px] text-center group transition-all"
            >
              {/* Category Icon / Custom Asset */}
              <div className="h-7 sm:h-8 flex items-center justify-center">
                {cat.image && cat.image.startsWith("/images/categories/") ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-7 sm:h-8 w-auto max-w-[36px] object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-xs"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200 drop-shadow-xs flex items-center justify-center">
                    {cat.icon || "📱"}
                  </span>
                )}
              </div>

              {/* Category Name */}
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
