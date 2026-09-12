"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shop/ProductCard";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Star, ShieldCheck, MapPin, ShoppingCart, ChevronRight, RefreshCw, Truck, Plus, Minus, Heart } from "lucide-react";
import { getProductBySlug, products } from "@/lib/data/products";
import { phoneModels } from "@/lib/data/models";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    pincodeLocation,
    setPincode,
    productsList,
    brandsList,
    phoneModelsList,
    addRecentlyViewed
  } = useApp();
  const product = productsList.find((p) => p.slug === slug) || getProductBySlug(slug);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      setSelectedImage(product.imageUrls[0] || "");
      if (product.variantsOptions?.color && product.variantsOptions.color.length > 0) {
        setSelectedColor(product.variantsOptions.color[0]);
      }
      if (product.requiresPhoneModel) {
        const defaultModel = phoneModelsList.find((m) => m.brandId === "apple")?.id || phoneModelsList[0]?.id;
        setSelectedModelId(defaultModel);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-slate-500 mt-2">The requested mobile accessory could not be located.</p>
          <Link href="/shop" className="mt-4 inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl">
            Return to Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const brand = brandsList.find((b) => b.id === product.brandId);

  // Check if item is currently in cart
  const cartItem = cart.find(
    (item) =>
      item.product.id === product.id &&
      (!selectedModelId || item.model?.id === selectedModelId) &&
      (!selectedColor || item.selectedColor === selectedColor)
  ) || cart.find((item) => item.product.id === product.id);

  const currentQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(product.id, selectedModelId || undefined, 1, selectedColor);
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateCartQuantity(cartItem.variantId, currentQuantity - 1);
    }
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateCartQuantity(cartItem.variantId, currentQuantity + 1);
    } else {
      addToCart(product.id, selectedModelId || undefined, 1, selectedColor);
    }
  };

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const relatedProducts = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb Bar */}
        <div className="text-xs text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href={`/shop?category=${product.categoryId}`} className="hover:text-blue-600">
            {product.categoryId.replace("-", " ").toUpperCase()}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden relative group shadow-sm">
              <img
                src={selectedImage || product.imageUrls[0]}
                alt={product.title}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
              {product.isPixKartAssured && (
                <span className="absolute top-3 left-3 bg-white/90 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> PixKart Verified
                </span>
              )}

              {/* Top-Right Floating Wishlist Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`absolute top-3 right-3 z-10 p-2.5 rounded-full border shadow-md transition-all cursor-pointer active:scale-90 ${
                  inWishlist
                    ? "bg-red-600 text-white border-red-600 shadow-red-600/30"
                    : "bg-white/90 hover:bg-white text-slate-500 hover:text-red-500 border-slate-200 hover:border-red-200"
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-white text-white" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Selector */}
            {product.imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                      selectedImage === url ? "border-blue-600 scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Pricing */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                {brand?.name || "Official Brand"}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.title}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-bold">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-white text-white" />
                </div>
                <span className="text-xs text-slate-500">
                  {product.reviewCount} Ratings & {Math.round(product.reviewCount * 0.4)} Reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {formatPrice(product.basePrice)}
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {product.discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Inclusive of all taxes • 100% Cash on Delivery (COD) Available</p>
            </div>

            {/* Trust Badges: "No Return Only Exchange" & "PixKart Verified" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-950 font-bold">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No Return, Only Exchange</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PixKart Verified Genuine</span>
              </div>
            </div>

            {/* Color Selector */}
            {product.variantsOptions?.color && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Color: <span className="text-blue-600">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variantsOptions.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        selectedColor === color
                          ? "bg-[#2874f0] text-white font-bold border-[#2874f0]"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Model Compatibility Selector */}
            {product.requiresPhoneModel && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-600 block">
                  Select Phone Model for Precision Fit:
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-blue-500 cursor-pointer"
                >
                  {phoneModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.series})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons: Add to Cart & Matching Amber Quantity Pill */}
            <div className="pt-2">
              {currentQuantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="flex-1 bg-[#ff9f00] text-slate-950 rounded-2xl p-1 flex items-center justify-between font-black text-sm shadow-md border border-amber-600/30">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="w-10 h-10 rounded-xl bg-[#e68a00] hover:bg-[#cc7a00] text-slate-950 flex items-center justify-center transition-all shrink-0 active:scale-90 cursor-pointer text-lg font-black"
                      title="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="flex items-center gap-2 px-3 select-none">
                      <span className="text-base font-black text-slate-950">{currentQuantity}</span>
                      <span className="text-xs font-black text-slate-950 uppercase tracking-tight">
                        IN CART
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-10 h-10 rounded-xl bg-[#e68a00] hover:bg-[#cc7a00] text-slate-950 flex items-center justify-center transition-all shrink-0 active:scale-90 cursor-pointer text-lg font-black"
                      title="Increase quantity"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  <Link
                    href="/cart"
                    className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 active:scale-98"
                  >
                    <span>View Cart</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical Specification Breakdown */}
        <section className="mt-12 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 font-display mb-4">
            Technical Specifications & Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between gap-4">
                <span className="text-slate-500 font-medium">{key}</span>
                <span className="text-slate-900 font-bold text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features List */}
        <section className="mt-8 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 font-display mb-4">
            Key Features & Protection
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            {product.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h3 className="text-2xl font-black text-slate-900 font-display mb-6">
              Similar Accessories You May Like
            </h3>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
