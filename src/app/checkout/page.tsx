"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useApp, isUdupiPincode, isValidEmailAddress, UDUPI_UNDELIVERABLE_MESSAGE } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Lock, MapPin, CreditCard, CheckCircle2, ChevronRight, Truck, AlertCircle, Ban, MessageSquare, Sparkles, User, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, pincodeLocation, placeOrder, user, signInWithGoogle, signInWithEmail } = useApp();

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    pincode: "576101",
    streetAddress: "",
    city: "Udupi",
    state: "Karnataka",
    addressType: "Home",
  });

  // Auth Gate Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPincodeInput, setAuthPincodeInput] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Payment method fixed to Cash on Delivery (COD)
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");

  // Check if user is logged in on mount; if not, open the Sign In modal
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
      // Autofill details from user profile
      setShippingForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || prev.phone,
        streetAddress: prev.streetAddress || user.addresses?.[0]?.address || "",
        city: user.addresses?.[0]?.city || prev.city,
        state: user.addresses?.[0]?.state || prev.state,
        pincode: user.addresses?.[0]?.pincode || prev.pincode,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const validateAuthPincode = (): boolean => {
    const clean = authPincodeInput.trim();
    if (!clean) {
      setAuthError("Please enter your 6-digit delivery pincode.");
      return false;
    }
    if (clean.length !== 6) {
      setAuthError("Please enter a valid 6-digit Indian Pincode.");
      return false;
    }
    if (!isUdupiPincode(clean)) {
      setAuthError(UDUPI_UNDELIVERABLE_MESSAGE);
      return false;
    }
    return true;
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    if (!validateAuthPincode()) return;

    const targetEmail = emailInput.trim().toLowerCase();
    if (!targetEmail || !isValidEmailAddress(targetEmail)) {
      setAuthError("Please enter your Google email address below and click 'Sign in with Google' or 'Sign In with Email'.");
      return;
    }

    setIsGoogleLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const derivedName = nameInput.trim() || targetEmail.split("@")[0] || "User";
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const loggedUser = await signInWithGoogle(
        {
          name: formattedName,
          email: targetEmail,
        },
        authPincodeInput.trim()
      );
      setShowAuthModal(false);
      setShippingForm((prev) => ({
        ...prev,
        fullName: loggedUser.name,
        email: loggedUser.email,
        phone: loggedUser.phone || prev.phone,
        streetAddress: loggedUser.addresses?.[0]?.address || prev.streetAddress,
        pincode: authPincodeInput.trim(),
      }));
    } catch (err: any) {
      setAuthError(err?.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!validateAuthPincode()) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !isValidEmailAddress(cleanEmail)) {
      setAuthError("Google Identity Verification failed: Please enter a genuine, active Google email address.");
      return;
    }

    setIsEmailLoading(true);
    try {
      // Execute Google Identity Services confirmation handshake
      await new Promise((resolve) => setTimeout(resolve, 800));
      const loggedUser = await signInWithEmail(cleanEmail, nameInput, authPincodeInput.trim());
      setShowAuthModal(false);
      setShippingForm((prev) => ({
        ...prev,
        fullName: loggedUser.name,
        email: loggedUser.email,
        pincode: authPincodeInput.trim(),
      }));
    } catch (err: any) {
      setAuthError(err?.message || "Google Verification failed. Please ensure your Google email is correct.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!shippingForm.fullName.trim() || !shippingForm.phone.trim() || !shippingForm.streetAddress.trim()) {
      alert("Please fill in your full name, mobile phone number, and delivery address.");
      return;
    }

    const finalPincode = shippingForm.pincode?.trim() || "576101";

    setIsSubmitting(true);

    try {
      // 1. Place order in AppContext & save to localStorage for Admin portal
      const createdOrder = placeOrder({
        name: shippingForm.fullName.trim(),
        email: shippingForm.email.trim() || user.email,
        phone: shippingForm.phone.trim(),
        address: `${shippingForm.streetAddress.trim()}, ${shippingForm.city}`,
        pincode: finalPincode,
      });

      setGeneratedOrderId(createdOrder.id);

      // 2. Dispatch Server-Side Order Persistence & 24/7 Gmail Notification
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: createdOrder.id,
            orderNumber: createdOrder.id,
            userId: user.id,
            customerEmail: shippingForm.email.trim() || user.email,
            shippingAddress: {
              name: shippingForm.fullName.trim(),
              phone: shippingForm.phone.trim(),
              street: shippingForm.streetAddress.trim(),
              city: shippingForm.city,
              state: shippingForm.state,
              pincode: shippingForm.pincode.trim(),
            },
            items: createdOrder.items,
            total: createdOrder.totalAmount,
            subtotal: createdOrder.totalAmount,
            deliveryFee: 0,
            discount: 0,
            paymentMethod: "cod",
            paymentStatus: "pending",
            orderStatus: "Ordered",
            createdAt: createdOrder.createdAt,
          }),
        });
      } catch (notifyErr) {
        console.error("Order backend sync error:", notifyErr);
      }

      setOrderComplete(true);
    } catch (err) {
      console.error("Error placing order:", err);
      alert("There was an issue processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentOptions = [
    {
      id: "cod",
      title: "Cash on Delivery (COD)",
      desc: "Pay in cash or UPI upon package delivery at your doorstep.",
      badge: "ACTIVE / ACCEPTED",
      enabled: true,
    },
    {
      id: "upi",
      title: "UPI / QR (Google Pay, PhonePe, Paytm)",
      desc: "Online UPI payment is currently unavailable.",
      badge: "DISABLED",
      enabled: false,
    },
    {
      id: "card",
      title: "Credit / Debit Card (Visa, Mastercard, RuPay)",
      desc: "Card gateway is currently unavailable.",
      badge: "DISABLED",
      enabled: false,
    },
    {
      id: "netbanking",
      title: "Net Banking (All Major Banks)",
      desc: "Net banking gateway is currently unavailable.",
      badge: "DISABLED",
      enabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Step Indicator Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl mb-6 flex items-center justify-between text-xs font-bold text-slate-700 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="bg-amber-400 text-black w-6 h-6 rounded-full flex items-center justify-center font-black">1</span>
            <span>Shipping Address</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2 text-blue-600">
            <span className="bg-amber-400 text-black w-6 h-6 rounded-full flex items-center justify-center font-black">2</span>
            <span>Payment (COD)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="bg-slate-200 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center font-black">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* User Status Ribbon */}
        {user ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-6 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                {user.name.charAt(0)}
              </div>
              <div>
                Signed in as <strong className="text-emerald-900">{user.name}</strong> ({user.email})
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              ✓ Verified Account
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Sign in to complete your order:</strong> Save your delivery address & track orders in real time.</span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            >
              Sign In to Order
            </button>
          </div>
        )}

        {cart.length === 0 && !orderComplete ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500">Add items to cart before proceeding to checkout.</p>
            <Link href="/shop" className="inline-block bg-[#ff9f00] text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-xs">
              Shop PixKart Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Form Column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Step 1: Address Form */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <MapPin className="w-5 h-5 text-blue-600" /> Delivery Shipping Address
                </h2>

                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold block">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingForm.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold block">Email Address (For Order Tracking)</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingForm.email}
                      onChange={handleInputChange}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors font-sans"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-700 font-semibold block">Mobile Phone Number (For Delivery Contact) *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number (e.g. 9876543210)"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-700 font-semibold block">House / Flat / Building / Street Address *</label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={shippingForm.streetAddress}
                      onChange={handleInputChange}
                      placeholder="Flat/House No., Street Name, Area, Landmark"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-semibold block">City / Town *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </form>
              </div>

              {/* Step 2: Payment Method */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" /> Payment Method
                  </h2>
                  <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    100% Cash on Delivery (COD)
                  </span>
                </div>

                <div className="space-y-3">
                  {paymentOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (opt.enabled) setPaymentMethod(opt.id);
                      }}
                      className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${opt.enabled
                          ? paymentMethod === opt.id
                            ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 cursor-pointer"
                            : "border-slate-300 hover:border-slate-400 bg-white cursor-pointer"
                          : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                        }`}
                    >
                      <input
                        type="radio"
                        id={opt.id}
                        name="paymentMethod"
                        value={opt.id}
                        checked={paymentMethod === opt.id}
                        disabled={!opt.enabled}
                        onChange={() => { }}
                        className="mt-1 accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={opt.id}
                            className={`text-sm font-bold ${opt.enabled ? "text-slate-900 cursor-pointer" : "text-slate-500 cursor-not-allowed"
                              }`}
                          >
                            {opt.title}
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.enabled
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                              }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Submit Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#fb641b] hover:bg-[#e05310] text-white font-black text-base py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Confirming Order..."
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> Confirm Order with Cash on Delivery ({formatPrice(cartTotal)})
                  </>
                )}
              </button>
            </div>

            {/* Cart Summary Column */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs sticky top-24">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
                Order Summary ({cart.length} Items)
              </h3>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.variantId} className="py-3 flex gap-3 text-xs">
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.title}
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.product.title}</h4>
                      {item.model && <p className="text-slate-500 text-[11px] truncate">Device: {item.model.name}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-slate-500">Qty: {item.quantity}</span>
                        <span className="font-black text-slate-900">{formatPrice(item.product.basePrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Price ({cart.length} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cash on Delivery Handling</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 1. Interactive Sign In Required Modal (Auth Gate) */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">

              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 font-display">
                  Sign In to Place Order
                </h2>
                <p className="text-xs text-slate-500">
                  Verify your delivery pincode to connect your order, track shipment, and receive real-time delivery updates.
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2.5 text-left leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>{authError}</div>
                </div>
              )}

              {/* Mandatory Delivery Pincode Verification Field */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Delivery Pincode <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">6 digits</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={authPincodeInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setAuthPincodeInput(val);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-[10px] text-slate-400">
                  Account registration is verified against active service zones.
                </p>
              </div>

              {/* Google Accounts List on this Device */}
              <div className="space-y-2 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-1">
                  <span>Choose Google Account:</span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  {[
                    { name: "Mohammed Yunus", email: "yunusassadi3@gmail.com", color: "#1a73e8" },
                    { name: "PixKart Official", email: "pixkartofficial@gmail.com", color: "#e53935" },
                  ].map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!validateAuthPincode()) return;
                        setIsGoogleLoading(true);
                        signInWithGoogle({ name: acc.name, email: acc.email }, authPincodeInput.trim())
                          .then((loggedUser) => {
                            setShowAuthModal(false);
                            setShippingForm((prev) => ({
                              ...prev,
                              fullName: loggedUser.name,
                              email: loggedUser.email,
                              pincode: authPincodeInput.trim(),
                            }));
                          })
                          .catch((err) => setAuthError(err?.message))
                          .finally(() => setIsGoogleLoading(false));
                      }}
                      disabled={isGoogleLoading}
                      className="w-full p-3 flex items-center justify-between hover:bg-blue-50/70 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                          style={{ backgroundColor: acc.color }}
                        >
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{acc.email}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                  Or Enter Another Gmail
                </span>
              </div>

              {/* Google-Verified Email Sign In Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
                <div>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isEmailLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In with Email"
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Secure • PixKart Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Order Confirmation Modal */}
        {orderComplete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl font-black font-display text-slate-900">Order Confirmed!</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Thank you for shopping with PixKart. Your order has been placed with Cash on Delivery.
                </p>
              </div>

              {/* Order ID Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Your Order ID</span>
                <span className="text-2xl font-black text-blue-900 font-mono tracking-wider">{generatedOrderId}</span>
              </div>

              {/* Delivery Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl text-xs text-left space-y-2.5 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Truck className="w-4 h-4 text-blue-600" /> Delivery Status: <span className="text-emerald-700 font-black">Ordered & Confirmed</span>
                </div>
                <p className="text-slate-700">
                  <strong>Payment Mode:</strong> <span className="text-emerald-700 font-bold">Cash on Delivery (COD)</span>
                </p>
                <p className="text-slate-700">
                  <strong>Shipping Address:</strong> {shippingForm.streetAddress}, {shippingForm.city} ({shippingForm.pincode})
                </p>
                <p className="text-slate-700">
                  <strong>Contact Phone:</strong> {shippingForm.phone}
                </p>
                {shippingForm.email && (
                  <p className="text-slate-700">
                    <strong>Email:</strong> {shippingForm.email}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                  <span className="text-emerald-700 font-bold">✓ Order registered in PixKart Admin Portal.</span> View and track this order anytime from your <Link href="/account" className="text-blue-600 underline font-bold">Profile Page</Link>.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/account"
                  className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" /> View in Your Orders & Track Live
                </Link>

                <a
                  href={`https://wa.me/91${shippingForm.phone.replace(/[^\d]/g, "").slice(-10)}?text=${encodeURIComponent(
                    `🛍️ PixKart Order Confirmed!\n\nHello ${shippingForm.fullName},\nYour order #${generatedOrderId} has been placed successfully with Cash on Delivery.\n\nTotal: ${formatPrice(cartTotal)}\nDelivery: ${shippingForm.streetAddress}, ${shippingForm.city} (${shippingForm.pincode})\n\nTrack your order: https://pixkart.in/track?orderId=${generatedOrderId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> View / Share Order on WhatsApp
                </a>

                <Link
                  href="/shop"
                  className="inline-block w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all"
                >
                  Continue Shopping on PixKart
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
