"use client";

import React from "react";
import PhoneSelectorWidget from "@/components/home/PhoneSelectorWidget";

export default function FlipkartStyleSections() {
  return (
    <div className="w-full bg-slate-50 text-slate-900 select-none pb-1">
      {/* Precision Device Finder Frame */}
      <section className="px-3 sm:px-6 pt-1 max-w-7xl mx-auto">
        <PhoneSelectorWidget />
      </section>
    </div>
  );
}
