"use client";

import React from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function InstagramGrid() {
  const images = [
    { id: 1, caption: "Perfect layout protection #pixkart", category: "Carbon Shield" },
    { id: 2, caption: "Perfect bubble-free fit #9hglass", category: "Tempered Glass" },
    { id: 3, caption: "Frictionless gaming sessions", category: "Matte Guard" },
    { id: 4, caption: "Sleek scratchproof carbon texture", category: "Carbon Shield" },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-light mb-2">
            <InstagramIcon className="w-3.5 h-3.5" /> Social Proof
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            PIXKART IN THE WILD
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
            Tag us <span className="text-gold">@PIXKART.in</span> with your hands-free setups to get featured.
          </p>
        </div>

        {/* UGC Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={img.id}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white/2 border border-white/5 group"
            >
              {/* Abstract Graphic representing lifestyle shot */}
              <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal flex flex-col items-center justify-center p-4">
                <span className="text-4xl mb-2 opacity-30">📱</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{img.category}</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-charcoal/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 text-center transition-all duration-300">
                <InstagramIcon className="w-6 h-6 text-gold mb-2" />
                <p className="text-xs text-white font-medium">{img.caption}</p>
                <span className="text-[9px] text-gray-400 mt-1">Click to view post</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
