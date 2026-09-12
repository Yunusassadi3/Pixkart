"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddressBar from "@/components/home/AddressBar";
import CategoryBar from "@/components/home/CategoryBar";
import Hero from "@/components/home/Hero";
import QuickDealsRail from "@/components/home/QuickDealsRail";
import FlipkartStyleSections from "@/components/home/FlipkartStyleSections";
import PromoAdBanners from "@/components/home/PromoAdBanners";
import SuggestedForYou from "@/components/home/SuggestedForYou";
import BrandsInSpotlight from "@/components/home/BrandsInSpotlight";
import FeaturedMobileAccessories from "@/components/home/FeaturedMobileAccessories";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Headphones, Zap, Heart, Star, ShoppingCart } from "lucide-react";

export default function Home() {
  const { productsList, categoriesList, addToCart, isInWishlist, removeFromWishlist, addToWishlist } = useApp();

  // Dynamically group products by category so ANY newly added product/category automatically appears on the home screen
  const categoriesWithProducts = useMemo(() => {
    if (!productsList || productsList.length === 0) return [];

    // Filter out unavailable / out-of-stock products (Requirement 5)
    const availableProducts = productsList.filter(
      (p) => p && p.id && p.title && p.stockStatus !== "out_of_stock"
    );

    const grouped: {
      id: string;
      name: string;
      slug: string;
      icon: string;
      tagline?: string;
      totalCount: number;
      products: typeof productsList;
    }[] = [];

    const processedProductIds = new Set<string>();

    // Helper to sort products so newest/recently added products appear first (Requirement 7)
    const sortByNewest = (items: typeof productsList) => {
      return [...items].sort((a, b) => {
        const timeA = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
        const timeB = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
        if (timeA && timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });
    };

    // 1. Group by registered categories in categoriesList
    (categoriesList || []).forEach((cat) => {
      const prods = availableProducts.filter((p) => {
        const pCat = (p.categoryId || "").toLowerCase().trim();
        const cId = (cat.id || "").toLowerCase().trim();
        const cSlug = (cat.slug || "").toLowerCase().trim();

        if (pCat === cId || pCat === cSlug) return true;
        if (cId === "cases-covers" && (pCat === "cases" || pCat === "covers" || pCat === "mobile-cases" || pCat === "back-covers")) return true;
        if (cId === "screen-protectors" && (pCat === "screen-guards" || pCat === "tempered-glass" || pCat === "glass")) return true;
        if (cId === "chargers-powerbanks" && (pCat === "chargers" || pCat === "powerbanks" || pCat === "wall-chargers" || pCat === "magsafe-accessories")) return true;
        if (cId === "earphones-tws" && (pCat === "earbuds" || pCat === "tws" || pCat === "audio")) return true;
        return false;
      });

      if (prods.length > 0) {
        prods.forEach((p) => processedProductIds.add(p.id));
        grouped.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon || "📱",
          tagline: cat.tagline,
          totalCount: prods.length,
          products: sortByNewest(prods),
        });
      }
    });

    // 2. Catch any custom categories added in admin that aren't in initialCategories
    const remainingProducts = availableProducts.filter((p) => !processedProductIds.has(p.id));
    if (remainingProducts.length > 0) {
      const byCatId: Record<string, typeof productsList> = {};
      remainingProducts.forEach((p) => {
        const cId = p.categoryId || "accessories";
        if (!byCatId[cId]) byCatId[cId] = [];
        byCatId[cId].push(p);
      });

      Object.entries(byCatId).forEach(([cId, prods]) => {
        const prettyName = cId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        grouped.push({
          id: cId,
          name: prettyName,
          slug: cId,
          icon: "⚡",
          totalCount: prods.length,
          products: sortByNewest(prods),
        });
      });
    }

    return grouped;
  }, [productsList, categoriesList]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 space-y-3 pb-8">
        {/* 1. Address Bar */}
        <AddressBar />

        {/* 2. Category Bar */}
        <CategoryBar />

        {/* 3. Hero Banner Frame */}
        <Hero />

        {/* 4. Personalized Quick Deals Rail */}
        <QuickDealsRail />

        {/* 5. Precision Device Finder */}
        <FlipkartStyleSections />

        {/* 6. Promotional AD Banners (ASUS Expertbook, Lenovo) */}
        <PromoAdBanners />

        {/* 7. Suggested For You Frame (Renders strictly when products exist in Admin) */}
        <SuggestedForYou />

        {/* 8. Brands in Spotlight */}
        <BrandsInSpotlight />

        {/* 9. Featured Mobile Accessories (Popular Deals container with timer & products from Admin) */}
        <FeaturedMobileAccessories />

        {/* 10. Dynamic Category Product Showcases (Organized by Category Name with 4-8 products and View All option) */}
        {categoriesWithProducts.map(({ id, name, slug, icon, tagline, products, totalCount }) => (
          <section key={id} className="px-3 sm:px-6 max-w-7xl mx-auto py-3">
            {/* Category Name Heading */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <div className="flex items-center gap-2">
                  {icon && <span className="text-xl sm:text-2xl">{icon}</span>}
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                    {name}
                  </h2>
                </div>
                {tagline && (
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                    {tagline}
                  </p>
                )}
              </div>
              <Link
                href={`/shop?category=${slug}`}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3-Column Grid of Products: Exactly 3 in each row matching the frames above */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
              {products.slice(0, 6).map((product) => {
                const isFav = isInWishlist(product.id);
                const buyAtPrice = Math.round(product.basePrice * 0.96);
                const imgUrl = product.imageUrls?.[0] || "/images/custom-category-icon.png";

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative group"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (isFav) removeFromWishlist(product.id);
                        else addToWishlist(product);
                      }}
                      className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center cursor-pointer transition-all ${
                        isFav ? "text-red-500 fill-red-500" : "text-slate-400 hover:text-red-500"
                      }`}
                      aria-label="Add to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
                    </button>

                    <Link href={`/shop/${product.slug}`} className="block relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-2">
                      <img
                        src={imgUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discountPercent > 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                          ↓{product.discountPercent}%
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-xs text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                        <span>{product.rating || 4.5}</span>
                        <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                      </div>
                    </Link>

                    <div className="space-y-1">
                      <Link href={`/shop/${product.slug}`}>
                        <h3
                          className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors"
                          title={product.title}
                        >
                          {product.title}
                        </h3>
                      </Link>

                      <div className="pt-0.5">
                        <div className="flex items-baseline gap-1">
                          {product.mrp > product.basePrice && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              {formatPrice(product.mrp)}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                            {formatPrice(product.basePrice)}
                          </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 font-mono">
                          Buy at {formatPrice(buyAtPrice)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-xs py-1.5 px-2 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom View All Link/Button */}
            <div className="mt-4 flex justify-center sm:justify-end px-1">
              <Link
                href={`/shop?category=${slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all group"
              >
                <span>View All {name} {totalCount > 8 ? `(${totalCount})` : ""}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        ))}

        {/* 12. PixKart Customer Promise Banner */}
        <section className="py-8 px-4 sm:px-6 bg-gradient-to-r from-[#2874f0] via-[#1d4ed8] to-[#1e40af] text-center text-white relative overflow-hidden rounded-3xl mx-3 sm:mx-6">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              PIXKART CUSTOMER PROMISE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              100% PixKart Verified • Delivery Across Udupi City
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto">
              Every smartphone and accessory sold on PIXKART is verified genuine with official brand warranty, tamper-proof packaging, 7-day hassle-free replacement, and express Cash on Delivery across Udupi & Manipal.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-7 py-3 rounded-xl shadow-xl transition-all"
              >
                Browse All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
