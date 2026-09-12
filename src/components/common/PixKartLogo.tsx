"use client";

import React from "react";

interface PixKartLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  theme?: "amber" | "light" | "dark" | "blue";
  className?: string;
}

export default function PixKartLogo({
  size = "md",
  showTagline = false,
  theme = "amber",
  className = "",
}: PixKartLogoProps) {
  // Dimensions for Icon & Typography - scaled up for optimal visual balance
  const iconSizes = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-15 h-15",
    xl: "w-18 h-18",
  }[size];

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl sm:text-[26px]",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  }[size];

  const paddingSizes = {
    sm: "px-2.5 py-1",
    md: "px-3 py-1",
    lg: "px-4 py-1.5",
    xl: "px-5 py-2",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* 100% Frameless Transparent Ribbon 'P' Brand Emblem */}
      <div className={`relative shrink-0 ${iconSizes} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {/* Subtle Ambient Golden/Pink Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-amber-400 to-orange-500 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />

        {/* Clean, Frameless Transparent Ribbon 'P' Icon */}
        <img
          src="/images/pixkart-icon.png"
          alt="PixKart Logo"
          className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] group-hover:drop-shadow-[0_4px_14px_rgba(236,72,153,0.5)] transition-all duration-300"
        />
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <div
            className={`font-black ${textSizes} ${paddingSizes} tracking-wider italic rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02] flex items-center leading-none ${
              theme === "amber"
                ? "bg-amber-400 text-slate-950"
                : theme === "light"
                ? "bg-white text-slate-950 shadow-sm border border-slate-200"
                : theme === "blue"
                ? "bg-blue-600 text-white border border-blue-400/30"
                : "bg-black text-amber-400 border border-amber-400/50"
            }`}
          >
            <span>PIX</span>
            <span className={theme === "amber" ? "text-slate-950 drop-shadow-xs" : "text-amber-400"}>KART</span>
          </div>
        </div>

        {showTagline && (
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 mt-1 leading-none pl-0.5">
            Mobile & Accessories
          </span>
        )}
      </div>
    </div>
  );
}
