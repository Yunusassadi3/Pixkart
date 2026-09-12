"use client";

import React from "react";

interface CustomCategoryIconProps {
  className?: string;
  size?: number;
  active?: boolean;
}

export default function CustomCategoryIcon({
  className = "w-6 h-6",
  size = 24,
  active = false,
}: CustomCategoryIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${
        active ? "scale-105" : "scale-100"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* High-definition SVG rendering of Image 3: 3 rounded horizontal layers with swirling dynamic arrow */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Layer 1 - Top Bar */}
        <rect
          x="28"
          y="20"
          width="34"
          height="16"
          rx="3"
          fill="url(#cat_bar_grad_1)"
        />
        
        {/* Layer 2 - Middle Bar */}
        <rect
          x="28"
          y="42"
          width="40"
          height="16"
          rx="3"
          fill="url(#cat_bar_grad_2)"
        />
        
        {/* Layer 3 - Bottom Bar */}
        <rect
          x="28"
          y="64"
          width="46"
          height="16"
          rx="3"
          fill="url(#cat_bar_grad_3)"
        />

        {/* Dynamic Curved Swirling Arrow Base Loop (Dark Navy outer shadow / loop) */}
        <path
          d="M26 52 C12 62 14 85 34 85 C54 85 75 70 82 82 C88 92 78 98 72 90 C62 76 56 60 62 48"
          stroke="#172554"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Light Cyan Arrow Path Sweeping Across */}
        <path
          d="M72 100 C86 98 94 80 84 66 C74 52 50 72 38 82 C22 92 12 76 22 62 C34 46 62 26 76 28"
          stroke="#a5f3fc"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dynamic Glowing Arrow Stem */}
        <path
          d="M22 64 C26 50 48 24 72 16"
          stroke="#38bdf8"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Arrow Head Pointing Top-Right */}
        <path
          d="M72 10 L88 24 L64 34 L72 26 L62 20 Z"
          fill="#38bdf8"
          stroke="#e0f2fe"
          strokeWidth="2"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
        />

        {/* Linear Gradients for 3 Horizontal Bars */}
        <defs>
          <linearGradient id="cat_bar_grad_1" x1="28" y1="20" x2="62" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="cat_bar_grad_2" x1="28" y1="42" x2="68" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="cat_bar_grad_3" x1="28" y1="64" x2="74" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
