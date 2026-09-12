"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import CustomCategoryIcon from "@/components/common/CustomCategoryIcon";
import MenuDrawer from "@/components/layout/MenuDrawer";

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount, mobileMenuOpen, setMobileMenuOpen, user } = useApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = mounted ? user : null;
  const activeCartCount = mounted ? cartCount : 0;

  // Hide bottom navigation bar completely on Admin / Tanzar pages
  if (pathname.startsWith("/admin") || pathname.toLowerCase().startsWith("/tanzar")) {
    return null;
  }

  const isHomeActive = pathname === "/" && !mobileMenuOpen;
  const isCategoriesActive = mobileMenuOpen || pathname === "/shop";
  const isAccountActive = (pathname === "/account" || pathname === "/signin") && !mobileMenuOpen;
  const isCartActive = pathname === "/cart" && !mobileMenuOpen;

  const handleCategoriesClick = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavItemClick = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar (Mobile Only) - Matches Reference Image 2 & 3 */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] select-none"
      >
        <div className="max-w-md mx-auto flex items-center justify-around h-14 px-1">
          
          {/* 1. HOME TAB */}
          <Link
            href="/"
            onClick={handleNavItemClick}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group focus:outline-none"
          >
            {/* Top Indicator Pill */}
            <div
              className={`absolute top-0 w-10 h-1 bg-[#2874f0] rounded-b-md transition-opacity duration-200 ${
                isHomeActive ? "opacity-100" : "opacity-0"
              }`}
            />
            
            {/* Home Icon */}
            <svg
              className={`w-6 h-6 transition-colors duration-200 ${
                isHomeActive ? "text-[#2874f0]" : "text-slate-700"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-5h-6v5H4a1 1 0 0 1-1-1v-9.5z" />
            </svg>

            {/* Label */}
            <span
              className={`text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                isHomeActive ? "text-[#2874f0] font-bold" : "text-slate-700 font-medium"
              }`}
            >
              Home
            </span>
          </Link>

          {/* 2. CATEGORIES TAB (Custom Image 3 Symbol) */}
          <button
            type="button"
            onClick={handleCategoriesClick}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group focus:outline-none"
          >
            {/* Top Indicator Pill */}
            <div
              className={`absolute top-0 w-10 h-1 bg-[#2874f0] rounded-b-md transition-opacity duration-200 ${
                isCategoriesActive ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Custom 3-Layer Swirling Arrow Icon from Reference Image 3 */}
            <CustomCategoryIcon size={24} active={isCategoriesActive} />

            {/* Label */}
            <span
              className={`text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                isCategoriesActive ? "text-[#2874f0] font-bold" : "text-slate-700 font-medium"
              }`}
            >
              Categories
            </span>
          </button>

          {/* 3. ACCOUNT TAB */}
          <Link
            href="/account"
            onClick={handleNavItemClick}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group focus:outline-none"
          >
            {/* Top Indicator Pill */}
            <div
              className={`absolute top-0 w-10 h-1 bg-[#2874f0] rounded-b-md transition-opacity duration-200 ${
                isAccountActive ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* User Account Icon */}
            {activeUser?.avatar ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border ${isAccountActive ? "border-[#2874f0] ring-1 ring-[#2874f0]" : "border-slate-300"}`}>
                <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <svg
                className={`w-6 h-6 transition-colors duration-200 ${
                  isAccountActive ? "text-[#2874f0]" : "text-slate-700"
                }`}
                viewBox="0 0 24 24"
                fill={isAccountActive ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}

            {/* Label */}
            <span
              className={`text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                isAccountActive ? "text-[#2874f0] font-bold" : "text-slate-700 font-medium"
              }`}
            >
              Account
            </span>
          </Link>

          {/* 4. CART TAB */}
          <Link
            href="/cart"
            onClick={handleNavItemClick}
            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group focus:outline-none"
          >
            {/* Top Indicator Pill */}
            <div
              className={`absolute top-0 w-10 h-1 bg-[#2874f0] rounded-b-md transition-opacity duration-200 ${
                isCartActive ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Cart Icon with Red Badge */}
            <div className="relative flex items-center justify-center">
              <svg
                className={`w-6 h-6 transition-colors duration-200 ${
                  isCartActive ? "text-[#2874f0]" : "text-slate-700"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.2" />
                <circle cx="18" cy="20" r="1.2" />
                <path d="M1 2h3l2.4 12.5a2 2 0 0 0 2 1.5h9.5a2 2 0 0 0 2-1.5L22 6H5.5" />
              </svg>

              {/* Red Badge Indicator */}
              {activeCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff6161] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {activeCartCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] tracking-tight transition-colors duration-200 mt-0.5 ${
                isCartActive ? "text-[#2874f0] font-bold" : "text-slate-700 font-medium"
              }`}
            >
              Cart
            </span>
          </Link>

        </div>
      </nav>

      {/* Interactive Mobile Category & Filter Drawer */}
      <MenuDrawer />
    </>
  );
}
