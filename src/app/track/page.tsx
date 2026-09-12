"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/lib/data/orders";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Box,
  Compass,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const STATUS_STAGES: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  { status: "Ordered", label: "Ordered & Confirmed", desc: "Your order has been registered and confirmed with COD", icon: Clock },
  { status: "Packed", label: "Packed & Verified", desc: "Item verified, quality checked and packed in tamper-proof box", icon: Package },
  { status: "Shipped", label: "Shipped", desc: "Package handed over to our local delivery partner", icon: Box },
  { status: "On the Way", label: "On the Way", desc: "In transit through regional transit hub", icon: Compass },
  { status: "Out for Delivery", label: "Out for Delivery", desc: "Delivery executive is on the way to your doorstep", icon: Truck },
  { status: "Delivered", label: "Delivered", desc: "Package delivered and cash collected successfully", icon: CheckCircle2 },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ordersList, updateOrderStatus } = useApp();

  const [searchOrderId, setSearchOrderId] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Sync with URL query parameter ?orderId=
  useEffect(() => {
    const paramId = searchParams.get("orderId");
    if (paramId) {
      setSearchOrderId(paramId);
      performSearch(paramId);
    }
  }, [searchParams, ordersList]);

  const performSearch = (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;

    setHasSearched(true);
    // Support searching with or without "ORD-" prefix
    const found = ordersList.find(
      (o) =>
        o.id.toUpperCase() === cleanId ||
        o.id.toUpperCase() === `ORD-${cleanId}` ||
        cleanId.endsWith(o.id.replace("ORD-", ""))
    );

    if (found) {
      setActiveOrder(found);
      setSearchError(false);
    } else {
      setActiveOrder(null);
      setSearchError(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    router.push(`/track?orderId=${encodeURIComponent(searchOrderId.trim())}`);
    performSearch(searchOrderId.trim());
  };

  // Helper to determine stage active index
  const getStageIndex = (status: OrderStatus): number => {
    return STATUS_STAGES.findIndex((s) => s.status === status);
  };

  const currentStageIndex = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          <Truck className="w-3.5 h-3.5 text-blue-600" /> Live Udupi Shipment Tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
          Track Your PixKart Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your Order ID below to get real-time delivery status updates, live courier location, and order item details.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="max-w-xl mx-auto mb-10">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
        >
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. ORD-98241)"
            className="w-full bg-transparent text-sm text-slate-900 font-mono font-medium outline-none placeholder:text-slate-400 px-2 py-2"
          />
          <button
            type="submit"
            className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            Track Order
          </button>
        </form>

        {/* Quick Recent Orders */}
        {ordersList.length > 0 && !activeOrder && (
          <div className="mt-3 text-center text-xs text-slate-500">
            <span>Recent Orders: </span>
            <div className="inline-flex flex-wrap justify-center gap-2 mt-1">
              {ordersList.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setSearchOrderId(ord.id);
                    performSearch(ord.id);
                  }}
                  className="font-mono text-blue-600 hover:text-blue-800 font-bold underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 cursor-pointer"
                >
                  {ord.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Error State */}
      {hasSearched && searchError && (
        <div className="max-w-lg mx-auto bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We couldn't find any active order matching <strong className="font-mono text-slate-900">{searchOrderId}</strong>. Please double-check your Order ID.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block bg-[#ff9f00] text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs"
            >
              Back to PixKart Megastore
            </Link>
          </div>
        </div>
      )}

      {/* Active Order Tracking Result */}
      {activeOrder && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Order Header Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID:</span>
                <span className="text-xl font-black text-blue-600 font-mono">{activeOrder.id}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Cash on Delivery (COD)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Placed on: {new Date(activeOrder.createdAt).toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Amount (COD)</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {formatPrice(activeOrder.totalAmount)}
                </span>
              </div>

              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                activeOrder.status === "Delivered"
                  ? "bg-emerald-600 text-white"
                  : activeOrder.status === "Cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
              }`}>
                {activeOrder.status === "Cancelled" ? <XCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                {activeOrder.status}
              </span>

              {/* Cancel Order Button for Users */}
              {activeOrder.status === "Ordered" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                      updateOrderStatus(activeOrder.id, "Cancelled");
                      alert("Your order has been cancelled successfully.");
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Cancel this order"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" /> Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Notice or 6-Stage Visual Stepper Timeline */}
          {activeOrder.status === "Cancelled" ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-xs flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-red-950">This Order Has Been Cancelled</h3>
                <p className="text-xs text-red-700 leading-relaxed">
                  This order was cancelled and will not be dispatched. No payment will be collected on delivery. If you cancelled by mistake or need help, please contact our support team.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" /> Live Tracking Timeline
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Live Status: <strong className="text-blue-600 font-bold">{activeOrder.status}</strong>
                </span>
              </div>

            {/* Stepper Progress Bar */}
            <div className="relative">
              {/* Desktop Stepper Bar */}
              <div className="hidden lg:grid grid-cols-6 gap-2 relative">
                {STATUS_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.status} className="flex flex-col items-center text-center relative z-10">
                      {/* Circle Icon */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110"
                            : isCompleted
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Title */}
                      <h4 className={`text-xs font-bold ${isCurrent ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                        {stage.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight max-w-[130px]">
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}

                {/* Connecting Track Line */}
                <div className="absolute top-6 left-12 right-12 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(currentStageIndex / (STATUS_STAGES.length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mobile Stepper (Vertical) */}
              <div className="lg:hidden space-y-6 relative pl-6 border-l-2 border-slate-200 ml-4">
                {STATUS_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.status} className="relative">
                      {/* Step Indicator Node */}
                      <div
                        className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${isCurrent ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                          {stage.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

          {/* Details Grid: Ordered Items + Shipping Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Ordered Items List */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 uppercase tracking-wider">
                Items in this Shipment ({activeOrder.items.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.productTitle}</h4>
                        {item.modelName && (
                          <span className="text-[11px] text-slate-500 block">For {item.modelName}</span>
                        )}
                        <span className="text-xs text-slate-500">
                          Qty: <strong className="text-slate-800 font-bold">{item.quantity}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-bold text-slate-900 block">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({formatPrice(item.price)} each)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Help Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Shipping Address Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Delivery Address
                </h3>
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold text-slate-900">{activeOrder.customerName}</p>
                  <p>{activeOrder.address}</p>
                  <p className="font-mono font-semibold">Pincode: {activeOrder.pincode}</p>
                  <p className="text-blue-600 font-mono font-medium pt-1">
                    Contact: {activeOrder.phone}
                  </p>
                </div>
              </div>

              {/* Need Help Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" /> Need Help with Your Order?
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Have questions about delivery timing, address changes, or product details?
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/919876543210?text=Hi%20PixKart,%20I%20have%20an%20inquiry%20about%20Order%20${activeOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    Chat on WhatsApp Support
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Order Tracking...</div>}>
          <TrackOrderContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
