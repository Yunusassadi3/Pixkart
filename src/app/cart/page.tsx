"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Ticket, Check } from "lucide-react";

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, cartTotal, pincodeLocation } = useApp();

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "PIXKART100" || couponCode.toUpperCase() === "SAVE100" || couponCode.toUpperCase() === "PIXKART50") {
      setDiscountAmount(100);
      setCouponApplied(true);
    } else {
      alert("Invalid coupon code. Try using 'PIXKART100' for ₹100 off!");
    }
  };

  const mrpTotal = cart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const discountMrp = mrpTotal > cartTotal ? mrpTotal - cartTotal : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mb-6">
          Shopping Cart ({cart.length} {cart.length === 1 ? "Item" : "Items"})
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="text-5xl">🛒</div>
            <h2 className="text-xl font-bold text-slate-900">Your PixKart Cart is Empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore smartphones, TWS earbuds, ANC headphones, fast chargers, and accessories.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#ff9f00] hover:bg-[#e68f00] text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all shadow"
            >
              Shop Mobile Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List Column */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Delivery Bar */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between text-xs shadow-sm">
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Qualified for FREE Delivery across Udupi City to {pincodeLocation}
                </span>
              </div>

              {cart.map((item) => {
                const itemPrice = item.product.basePrice;
                return (
                  <div
                    key={item.variantId}
                    className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Product Thumbnail */}
                      <Link href={`/shop/${item.product.slug}`} className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={item.product.imageUrls[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <Link href={`/shop/${item.product.slug}`}>
                          <h3 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate">
                            {item.product.title}
                          </h3>
                        </Link>
                        {item.model && (
                          <span className="text-[11px] text-blue-600 font-medium block">
                            Fits: {item.model.name}
                          </span>
                        )}
                        {(item.selectedColor || item.selectedStorage) && (
                          <span className="text-[11px] text-slate-500 block">
                            Variant: {item.selectedStorage} {item.selectedColor}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          In Stock • 7-Day Replacement
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 font-mono block">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                        {item.product.mrp > itemPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(item.product.mrp * item.quantity)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 text-slate-700 hover:text-black hover:bg-slate-200"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-900 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 text-slate-700 hover:text-black hover:bg-slate-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Coupon Code Card */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-blue-600" /> Apply PixKart Coupon
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. PIXKART100)"
                    className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </form>
                {couponApplied && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Coupon 'PIXKART100' Applied (₹100 Off)
                  </p>
                )}
              </div>

              {/* Price Details Breakdown */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider">
                  Price Details ({cart.length} Items)
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total M.R.P.</span>
                    <span className="font-mono text-slate-400 line-through">
                      {formatPrice(mrpTotal || cartTotal)}
                    </span>
                  </div>

                  {discountMrp > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount on M.R.P.</span>
                      <span className="font-mono">- {formatPrice(discountMrp)}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount</span>
                      <span className="font-mono">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-blue-600 font-mono">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {discountMrp > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 text-center font-bold">
                    🎉 You saved {formatPrice(discountMrp + discountAmount)} on this order!
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="w-full bg-[#fb641b] hover:bg-[#e55913] text-white font-black text-sm py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
