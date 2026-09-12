"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { brands, Brand } from "@/lib/data/brands";
import { getSeriesByBrand, getModelsBySeries, PhoneModel } from "@/lib/data/models";
import { ChevronRight, ArrowLeft, Check, Smartphone, Layers, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/icons/BrandLogos";

export default function SmartMatrix() {
  const { setSelectedDevice, selectedModel, brandsList, phoneModelsList } = useApp();
  const [step, setStep] = useState(1); // 1: Brand, 2: Series, 3: Model
  const [tempBrand, setTempBrand] = useState<Brand | null>(null);
  const [tempSeries, setTempSeries] = useState<string>("");
  const router = useRouter();

  const handleBrandSelect = (brand: Brand) => {
    setTempBrand(brand);
    setStep(2);
  };

  const handleSeriesSelect = (series: string) => {
    setTempSeries(series);
    setStep(3);
  };

  const handleModelSelect = (model: PhoneModel) => {
    if (tempBrand) {
      setSelectedDevice(tempBrand, model);
      router.push(`/shop?brand=${tempBrand.id}&model=${model.slug}`);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setTempBrand(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };

  return (
    <section id="selector-wizard" className="py-16 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">
            FIND YOUR PERFECT ACCESSORY FIT
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Skip the infinite dropdown fatigue. Select your device parameters below to dynamically filter the store catalog.
          </p>
        </div>

        {/* Bento Stepper Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 min-h-[420px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs uppercase font-extrabold tracking-widest text-gold">
                Step {step} of 3: {step === 1 ? "Select Brand" : step === 2 ? "Select Series" : "Select Model"}
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "bg-gold w-6"
                      : s < step
                      ? "bg-emerald"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Panel */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="text-base text-gray-400 font-semibold mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gold" /> Which brand is your smartphone?
                  </h3>
                  <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                  >
                    {brandsList
                      .filter((b) => b.categoryType === "phone" || b.categoryType === "all")
                      .map((brand) => (
                        <motion.button
                          variants={itemVariants}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className="group flex flex-col items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-gold/30 glow-card transition-all duration-300 h-32 cursor-pointer backdrop-blur-md"
                        >
                          <div className="h-16 w-full flex items-center justify-center p-1.5">
                            <BrandLogo brandId={brand.id} logo={brand.logo} name={brand.name} className="h-11 w-auto max-w-[85%] object-contain text-gray-400 group-hover:text-gold group-hover:scale-105 transition-all duration-300" />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-gold font-display">{brand.name}</span>
                        </motion.button>
                      ))}
                  </motion.div>
                </motion.div>
              )}

              {step === 2 && tempBrand && (
                <motion.div
                  key="step2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="text-base text-gray-400 font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gold" /> Select {tempBrand.name} series
                  </h3>
                  <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {Array.from(new Set(phoneModelsList.filter((m) => m.brandId === tempBrand.id).map((m) => m.series))).map((series) => (
                      <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={series}
                        onClick={() => handleSeriesSelect(series)}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-gold/30 transition-all duration-200"
                      >
                        <span className="text-sm font-medium text-white">{series}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {step === 3 && tempBrand && (
                <motion.div
                  key="step3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <h3 className="text-base text-gray-400 font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-light" /> Confirm exact {tempBrand.name} {tempSeries} model
                  </h3>
                  <motion.div
                    variants={gridVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {phoneModelsList.filter((m) => m.brandId === tempBrand.id && m.series === tempSeries).map((model) => (
                      <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/3 hover:bg-white/10 border border-white/5 hover:border-emerald/40 transition-all duration-200"
                      >
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{model.name}</p>
                          {model.displaySize && <span className="text-[10px] text-gray-500">{model.displaySize} display</span>}
                        </div>
                        <Check className="w-4 h-4 text-emerald-light opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Info */}
          {selectedModel && step === 1 && (
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span>Current Device Filter: <strong className="text-emerald-light">{selectedModel.name}</strong></span>
              <button
                onClick={() => setSelectedDevice(null, null)}
                className="text-red-400 hover:underline"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
