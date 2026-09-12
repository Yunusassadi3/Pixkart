"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useApp, UserAddress } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import {
  User,
  Settings,
  Bell,
  Heart,
  ChevronRight,
  ChevronDown,
  Truck,
  Package,
  Smartphone,
  MapPin,
  Globe,
  Shield,
  Edit3,
  MessageCircle,
  HelpCircle,
  LogOut,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    signOutUser,
    updateUserProfile,
    saveUserAddress,
    deleteUserAddress,
    userOrders,
    recentlyViewed,
    wishlist,
    addToCart,
    productsList,
  } = useApp();

  // Active Modals State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addressesModalOpen, setAddressesModalOpen] = useState(false);
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [faqsModalOpen, setFaqsModalOpen] = useState(false);

  // Edit Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  React.useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "");
      setProfileEmail(user.email);
    } else {
      // Immediate protection: redirect deleted/unauthenticated users
      router.replace("/signin?redirect=/account");
    }
  }, [user, router]);

  // New Address Form State
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Language Selection State
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Notification Preferences State
  const [orderSms, setOrderSms] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);

  // Active Top Tab for Scrolling
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim(),
    });
    setEditProfileOpen(false);
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrPincode.trim()) {
      alert("Please fill in address and pincode.");
      return;
    }
    const newAddr: UserAddress = {
      id: `addr_${Date.now()}`,
      name: addrName.trim() || user?.name || "Customer",
      phone: addrPhone.trim() || user?.phone || "+91 98765 43210",
      address: addrStreet.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      isDefault: addrIsDefault,
    };
    saveUserAddress(newAddr);
    setNewAddressOpen(false);
    // Reset fields
    setAddrStreet("");
    setAddrPincode("");
  };

  const handleLogout = () => {
    signOutUser();
    router.push("/");
  };

  // If user is not logged in, show Guest Sign In view
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
            <User className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Welcome to Your PixKart Account
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sign in with Google to view your past orders, manage delivery addresses, track live shipments, and edit your profile.
            </p>
          </div>
          <Link
            href="/signin?redirect=/account"
            className="inline-flex items-center justify-center gap-2 bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-8 rounded-2xl shadow-md transition-all"
          >
            Sign In with Google <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Recommended Category Visual Cards matching Image 1 ("Keep shopping for")
  const keepShoppingItems = [
    {
      id: "cat_1",
      title: "5G Smartphones",
      views: "4 viewed",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
      link: "/shop?category=mobiles",
    },
    {
      id: "cat_2",
      title: "Audio & TWS Earbuds",
      views: "1 viewed",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80",
      link: "/shop?category=earphones-tws",
    },
    {
      id: "cat_3",
      title: "Fast 65W Chargers",
      views: "2 viewed",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80",
      link: "/shop?category=chargers-powerbanks",
    },
    {
      id: "cat_4",
      title: "Cases & Covers",
      views: "1 viewed",
      image: "/images/back-covers-logo.png",
      link: "/shop?category=cases-covers",
    },
    {
      id: "cat_5",
      title: "Smartwatches",
      views: "1 viewed",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80",
      link: "/shop?category=smartwatches",
    },
    {
      id: "cat_6",
      title: "Gaming Headphones",
      views: "1 viewed",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
      link: "/shop?category=headphones",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full space-y-6">
        
        {/* ========================================================= */}
        {/* 1. TOP PROFILE HEADER (Matches Reference Image 1)         */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          {/* Left: Avatar + Hello, Yunus */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setEditProfileOpen(true)}>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300 shadow-xs">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-base font-bold text-slate-900">
                Hello, {user.name}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          {/* Right Icons: Settings, Notifications, Country/Language */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditProfileOpen(true)}
              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              title="Account Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setNotificationsModalOpen(true)}
              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={() => setLanguageModalOpen(true)}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-xs font-bold text-slate-800 transition-colors"
            >
              <span>🇮🇳</span>
              <span>EN</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TOP ACTION PILLS (Matches Image 1 + Wishlist Heart)    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Pill 1: Orders */}
          <button
            onClick={() => scrollToSection("your-orders")}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-full shadow-xs transition-all text-center hover:border-slate-400"
          >
            Orders
          </button>

          {/* Pill 2: Buy Again */}
          <button
            onClick={() => scrollToSection("buy-again")}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-full shadow-xs transition-all text-center hover:border-slate-400"
          >
            Buy Again
          </button>

          {/* Pill 3: Account */}
          <button
            onClick={() => scrollToSection("account-settings")}
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-full shadow-xs transition-all text-center hover:border-slate-400"
          >
            Account
          </button>

          {/* Pill 4: Wishlist with Heart symbol inside frame */}
          <Link
            href="/wishlist"
            className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-full shadow-xs transition-all flex items-center justify-center gap-1.5 hover:border-slate-400"
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Wishlist ({wishlist.length})</span>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* 3. YOUR ORDERS SECTION (Matches Reference Image 1)        */}
        {/* ========================================================= */}
        <section id="your-orders" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Orders</h2>
            {userOrders.length > 0 && (
              <span className="text-xs text-slate-500 font-medium">{userOrders.length} Orders Placed</span>
            )}
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-xs">
              <p className="text-sm text-slate-600">Hi! You have no recent orders.</p>
              <Link
                href="/"
                className="inline-block w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs py-3 px-8 rounded-xl shadow-xs transition-all"
              >
                Return to the Homepage
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
                      <span className="font-bold text-slate-900">{formatPrice(ord.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID</span>
                      <span className="font-mono font-bold text-blue-600">{ord.id}</span>
                    </div>
                    <div>
                      <span
                        className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          ord.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "Shipped" || ord.status === "On the Way" || ord.status === "Out for Delivery"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        ● {ord.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.productTitle}</h4>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} • {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    <Link
                      href={`/track?orderId=${ord.id}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Live Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. BUY AGAIN SECTION (Matches Reference Image 1)          */}
        {/* ========================================================= */}
        <section id="buy-again" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Buy Again</h2>
            <ChevronRight className="w-5 h-5 text-slate-700 cursor-pointer" />
          </div>
          <p className="text-xs text-slate-500">See what others are reordering on Buy Again</p>

          <Link
            href="/shop"
            className="block w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all text-center"
          >
            Visit Buy Again
          </Link>
        </section>

        {/* ========================================================= */}
        {/* 5. KEEP SHOPPING FOR GRID (Matches Reference Image 1)     */}
        {/* ========================================================= */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Keep shopping for</h2>
            <ChevronRight className="w-5 h-5 text-slate-700 cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {keepShoppingItems.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2 hover:border-blue-500 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {item.views}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-right">
            <button
              onClick={() => router.push("/shop")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. ACCOUNT SETTINGS (Matches Image 2 - Red X Excluded)    */}
        {/* ========================================================= */}
        <section id="account-settings" className="space-y-6 pt-4 border-t border-slate-200">
          
          {/* Category Group 1: Account Settings */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Account Settings</h3>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              
              {/* Manage Devices */}
              <div
                onClick={() => setDevicesModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Manage Devices</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Edit Profile */}
              <div
                onClick={() => setEditProfileOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Edit Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Saved Addresses */}
              <div
                onClick={() => setAddressesModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Saved Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Select Language */}
              <div
                onClick={() => setLanguageModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Select Language ({selectedLanguage})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Notification Settings */}
              <div
                onClick={() => setNotificationsModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Notification Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Privacy Center */}
              <div
                onClick={() => setPrivacyModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Privacy Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

            </div>
          </div>

          {/* Category Group 2: My Activity */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">My Activity</h3>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              
              {/* Reviews */}
              <div
                onClick={() => setReviewsModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Reviews</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Questions & Answers */}
              <div
                onClick={() => setFaqsModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Questions & Answers</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

            </div>
          </div>

          {/* Category Group 3: Feedback & Information */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Feedback & Information</h3>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              
              {/* Browse FAQs */}
              <div
                onClick={() => setFaqsModalOpen(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Browse FAQs</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

            </div>
          </div>

          {/* Log Out Button (Clean full width button) */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-slate-300 hover:bg-red-50 hover:border-red-300 text-blue-600 hover:text-red-600 font-bold text-xs py-3.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>

        </section>

      </main>

      {/* ========================================================= */}
      {/* MODALS & INTERACTIVE DRAWERS                              */}
      {/* ========================================================= */}

      {/* 1. Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Edit Profile Details
              </h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#2874f0] text-white font-bold text-xs py-3 rounded-xl mt-2 shadow-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Saved Addresses Modal */}
      {addressesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Saved Delivery Addresses
              </h3>
              <button onClick={() => setAddressesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {user.addresses?.map((addr) => (
                <div key={addr.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{addr.name}</span>
                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-slate-500 font-mono">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>

            <div className="shrink-0 pt-2">
              <button
                onClick={() => {
                  setAddressesModalOpen(false);
                  setNewAddressOpen(true);
                }}
                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add New Address Modal */}
      {newAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Delivery Address</h3>
              <button onClick={() => setNewAddressOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <input
                type="text"
                value={addrName}
                onChange={(e) => setAddrName(e.target.value)}
                placeholder="Full Name *"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
              <input
                type="tel"
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                placeholder="Mobile Phone Number *"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
              />
              <input
                type="text"
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                placeholder="Flat / Street / Landmark *"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  placeholder="City"
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
                <input
                  type="text"
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value)}
                  placeholder="Pincode *"
                  required
                  maxLength={6}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#2874f0] text-white font-bold text-xs py-3 rounded-xl mt-2 shadow-md"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Manage Devices Modal */}
      {devicesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" /> Active Logged-In Devices
              </h3>
              <button onClick={() => setDevicesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-emerald-950 block">This Device (Chrome on Windows)</strong>
                  <span className="text-[11px] text-emerald-700">Active Now • Mumbai, India</span>
                </div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">Current</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Mobile Web App (Android)</strong>
                  <span className="text-[11px] text-slate-500">Last active 2 hours ago</span>
                </div>
                <button className="text-red-500 hover:underline font-bold text-[11px]">Revoke</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Select Language Modal */}
      {languageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Select Store Language
              </h3>
              <button onClick={() => setLanguageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {["English", "हिन्दी (Hindi)", "मराठी (Marathi)", "বাংলা (Bengali)", "ગુજરાતી (Gujarati)"].map((lang) => (
                <div
                  key={lang}
                  onClick={() => {
                    setSelectedLanguage(lang.split(" ")[0]);
                    setLanguageModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedLanguage === lang.split(" ")[0]
                      ? "border-blue-600 bg-blue-50 font-bold text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <span>{lang}</span>
                  {selectedLanguage === lang.split(" ")[0] && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Notifications Settings Modal */}
      {notificationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> Notification Preferences
              </h3>
              <button onClick={() => setNotificationsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span>WhatsApp Order Tracking Updates</span>
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="accent-blue-600 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span>Order Confirmation SMS Alerts</span>
                <input
                  type="checkbox"
                  checked={orderSms}
                  onChange={(e) => setOrderSms(e.target.checked)}
                  className="accent-blue-600 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span>Special Offers & Price Drops</span>
                <input
                  type="checkbox"
                  checked={promoOffers}
                  onChange={(e) => setPromoOffers(e.target.checked)}
                  className="accent-blue-600 w-4 h-4"
                />
              </label>
            </div>
            <button
              onClick={() => setNotificationsModalOpen(false)}
              className="w-full bg-[#2874f0] text-white font-bold text-xs py-3 rounded-xl"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* 7. Privacy Center Modal */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Privacy & Security Center
              </h3>
              <button onClick={() => setPrivacyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <p>• <strong>Authentication Provider:</strong> {user.provider === "google" ? "Google OAuth 2.0" : "Verified Email"}</p>
              <p>• <strong>Encrypted Data:</strong> All order records and address books are protected with 256-bit encryption.</p>
              <p>• <strong>Data Sharing:</strong> PixKart never sells your personal phone number or email to 3rd party marketing lists.</p>
            </div>
            <button
              onClick={() => setPrivacyModalOpen(false)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 8. FAQs Drawer */}
      {faqsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" /> Frequently Asked Questions (FAQs)
              </h3>
              <button onClick={() => setFaqsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs divide-y divide-slate-100">
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">How does Cash on Delivery (COD) work?</strong>
                <p className="text-slate-600">You pay in cash or via mobile UPI QR code to the delivery courier when the package arrives at your doorstep.</p>
              </div>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">How do I track my order?</strong>
                <p className="text-slate-600">Click on 'Track Order' in the header or profile page and enter your 8-character Order ID.</p>
              </div>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">What is the return & replacement policy?</strong>
                <p className="text-slate-600">PixKart offers a 7-day replacement guarantee on all manufacturing defects.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Reviews Modal */}
      {reviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> My Ratings & Reviews
              </h3>
              <button onClick={() => setReviewsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-6 space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600">You haven't written any product reviews yet. Reviews on delivered orders will appear here.</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
