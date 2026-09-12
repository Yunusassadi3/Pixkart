"use client";

import React from "react";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BentoCategories() {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 12 } },
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              DESIGNED TO FIT. BUILT TO DEFLECT.
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-lg">
            Explore custom-cut protection shields and premium shockproof covers designed for daily drop security.
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs uppercase font-extrabold tracking-widest text-gold hover:text-gold-light mt-4 md:mt-0 flex items-center gap-1 border-b border-gold/30 pb-1"
        >
          Browse All Items <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-6 gap-6"
      >
        {/* Item 1: Tempered Glass (Wide - spans 3 cols) */}
        <motion.div
          variants={cardVariants}
          className="md:col-span-3 h-80 rounded-3xl glass-panel relative overflow-hidden group hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 to-transparent pointer-events-none" />
          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="text-4xl mb-4 block">🛡️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold bg-gold/15 px-2 py-0.5 rounded border border-gold/20">
              {categories[0].tagline}
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white mt-3">
              {categories[0].name}
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              {categories[0].description}
            </p>
          </div>
          <Link href={`/shop?category=${categories[0].slug}`} className="absolute inset-0 z-20" aria-label={categories[0].name} />
          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-gold group-hover:text-charcoal group-hover:border-gold transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Item 2: Premium Back Covers (Wide - spans 3 cols) */}
        <motion.div
          variants={cardVariants}
          className="md:col-span-3 h-80 rounded-3xl glass-panel relative overflow-hidden group hover:border-blue-900/30 hover:shadow-[0_0_30px_rgba(74,144,217,0.1)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent pointer-events-none" />
          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="text-4xl mb-4 block">💎</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-900/25 px-2 py-0.5 rounded border border-blue-900/30">
              {categories[3].tagline}
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white mt-3">
              {categories[3].name}
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              {categories[3].description}
            </p>
          </div>
          <Link href={`/shop?category=${categories[3].slug}`} className="absolute inset-0 z-20" aria-label={categories[3].name} />
          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Item 3: Privacy Glass (Wide - spans 3 cols) */}
        <motion.div
          variants={cardVariants}
          className="md:col-span-3 h-80 rounded-3xl glass-panel relative overflow-hidden group hover:border-emerald/30 hover:shadow-[0_0_30px_rgba(0,75,35,0.08)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 to-transparent pointer-events-none" />
          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="text-4xl mb-4 block">👁️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-light bg-emerald/15 px-2 py-0.5 rounded border border-emerald-light/20">
              {categories[2].tagline}
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white mt-3">
              {categories[2].name}
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              {categories[2].description}
            </p>
          </div>
          <Link href={`/shop?category=${categories[2].slug}`} className="absolute inset-0 z-20" aria-label={categories[2].name} />
          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-emerald-light group-hover:text-white group-hover:border-emerald-light transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Item 4: Matte Screen Protector (Wide - spans 3 cols) */}
        <motion.div
          variants={cardVariants}
          className="md:col-span-3 h-80 rounded-3xl glass-panel relative overflow-hidden group hover:border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/35 to-transparent pointer-events-none" />
          <div className="absolute top-8 left-8 right-8 z-10">
            <span className="text-4xl mb-4 block">🌫️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {categories[1].tagline}
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white mt-3">
              {categories[1].name}
            </h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              {categories[1].description}
            </p>
          </div>
          <Link href={`/shop?category=${categories[1].slug}`} className="absolute inset-0 z-20" aria-label={categories[1].name} />
          <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-charcoal group-hover:border-white transition-all duration-300">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}
