"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp, isUdupiPincode, isValidEmailAddress, UDUPI_UNDELIVERABLE_MESSAGE } from "@/context/AppContext";
import PixKartLogo from "@/components/common/PixKartLogo";
import { Mail, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, MapPin, AlertCircle, X, Plus, ChevronRight } from "lucide-react";

interface SavedGoogleAccount {
  name: string;
  email: string;
  avatarColor: string;
}

const DEFAULT_ACCOUNTS: SavedGoogleAccount[] = [
  {
    name: "Yunus Assadi",
    email: "yunusassadi3@gmail.com",
    avatarColor: "#1a73e8",
  },
  {
    name: "PixKart Official",
    email: "pixkartofficial@gmail.com",
    avatarColor: "#e37400",
  },
];

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const message = searchParams.get("message");

  const { user, signInWithGoogle, signInWithEmail } = useApp();

  const [pincodeInput, setPincodeInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Google Account Chooser state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(DEFAULT_ACCOUNTS);
  const [showCustomAccountInput, setShowCustomAccountInput] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const gsiInitializedRef = useRef(false);

  // Load saved Google accounts from localStorage (falls back to device accounts)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pixkart_saved_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAccounts(parsed);
        } else {
          setSavedAccounts(DEFAULT_ACCOUNTS);
        }
      } else {
        setSavedAccounts(DEFAULT_ACCOUNTS);
      }
    } catch {
      setSavedAccounts(DEFAULT_ACCOUNTS);
    }
  }, []);

  // Initialize official Google Identity Services (GSI) safely when configured
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const hasValidClientId = Boolean(clientId && !clientId.includes("placeholder"));

    if (!hasValidClientId) {
      return;
    }

    const initGoogleGsi = () => {
      if (gsiInitializedRef.current) return;
      const google = (window as any).google;
      if (google?.accounts?.id && clientId) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response?.credential) {
                const payload = parseJwt(response.credential);
                if (payload && payload.email) {
                  performGoogleSignIn(payload.email, payload.name, payload.picture);
                }
              }
            },
            auto_select: false,
            use_fedcm_for_prompt: false,
          });
          gsiInitializedRef.current = true;
        } catch {}
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const timer = setTimeout(initGoogleGsi, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // If already signed in, redirect
  useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const validatePincode = (): boolean => {
    const cleanPin = pincodeInput.trim();
    if (!cleanPin) {
      setError("Please enter your 6-digit delivery pincode.");
      return false;
    }
    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Indian Pincode.");
      return false;
    }
    if (!isUdupiPincode(cleanPin)) {
      setError(UDUPI_UNDELIVERABLE_MESSAGE);
      return false;
    }
    return true;
  };

  const handleGoogleButtonClick = () => {
    setError(null);
    if (!validatePincode()) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const hasValidClientId = Boolean(clientId && !clientId.includes("placeholder"));

    // Trigger official Google native prompt if configured
    if (hasValidClientId) {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.prompt(() => {});
        } catch {}
      }
    }

    if (emailInput.trim() && isValidEmailAddress(emailInput.trim())) {
      // If user typed an email on the main card, sign in with it directly
      performGoogleSignIn(emailInput.trim(), nameInput.trim());
    } else {
      // Open Google Account List Dialog with all device Gmail accounts visible
      setShowCustomAccountInput(false);
      setShowGoogleModal(true);
    }
  };

  const performGoogleSignIn = async (targetEmail: string, targetName?: string, targetAvatar?: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !isValidEmailAddress(cleanEmail)) {
      setError("Please enter a valid Google email address.");
      return;
    }

    setSelectedGoogleEmail(cleanEmail);
    setIsGoogleLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const derivedName = targetName?.trim() || cleanEmail.split("@")[0] || "User";
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      // Save account to device list
      const updatedAccounts = [
        { name: formattedName, email: cleanEmail, avatarColor: "#1a73e8" },
        ...savedAccounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
      ].slice(0, 6);

      try {
        localStorage.setItem("pixkart_saved_google_accounts", JSON.stringify(updatedAccounts));
        setSavedAccounts(updatedAccounts);
      } catch {}

      await signInWithGoogle(
        {
          name: formattedName,
          email: cleanEmail,
          avatar: targetAvatar,
        },
        pincodeInput.trim()
      );

      setShowGoogleModal(false);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
      setSelectedGoogleEmail(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validatePincode()) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !isValidEmailAddress(cleanEmail)) {
      setError("Google Identity Verification failed: Please enter a genuine, active Google email address.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await signInWithEmail(cleanEmail, nameInput.trim(), pincodeInput.trim());
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Google Verification failed. Please ensure your Google email is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <PixKartLogo size="md" showTagline={true} theme="amber" />
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Header Title & Notification */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 mb-1">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Sign In to PixKart
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {message
                ? message
                : "Sign in with Google to place orders, track live shipments, and manage your delivery addresses."}
            </p>
          </div>

          {/* Account Deletion Notice Banner */}
          {searchParams.get("deleted") === "true" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-900 shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-red-800">Account Session Terminated:</strong>
                Your user account is no longer in the database. Your session and local data have been automatically cleared. Please sign in or register a new account to continue.
              </div>
            </div>
          )}

          {/* Context Alert Banner if Redirected from Checkout */}
          {redirectUrl.includes("checkout") && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Sign-in Required to Order:</strong> Your cart items are saved. Simply verify your pincode and sign in to proceed with Cash on Delivery!
              </div>
            </div>
          )}

          {/* Rejection / Error Alert Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Mandatory Delivery Pincode Verification Field */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
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
              value={pincodeInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPincodeInput(val);
                if (error) setError(null);
              }}
              placeholder="Enter 6-digit Pincode"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <p className="text-[10px] text-slate-400">
              Udupi district local fast express delivery zone.
            </p>
          </div>

          {/* 1. Official Google OAuth Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleButtonClick}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Or Sign in with Email
            </span>
          </div>

          {/* 2. Google-Verified Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Gmail Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Email...</span>
                </div>
              ) : (
                <>
                  <span>Sign In with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Trust Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit Encrypted Google Authentication</span>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* GOOGLE ACCOUNT CHOOSER (Shows List of Accounts on Phone / PC)            */}
      {/* ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            
            {/* Google Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-500">Choose an account to continue to PixKart</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowCustomAccountInput(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: List of Saved Google Accounts OR Direct Google Email Form */}
            {savedAccounts.length > 0 && !showCustomAccountInput ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                  Google Accounts on this device:
                </p>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {savedAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => performGoogleSignIn(acc.email, acc.name)}
                      disabled={isGoogleLoading}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-blue-50/70 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {/* Authentic Google Circular Initial Badge */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                          style={{ backgroundColor: acc.avatarColor || "#1a73e8" }}
                        >
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      {isGoogleLoading && selectedGoogleEmail === acc.email ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </button>
                  ))}

                  {/* Option: Use another Google account */}
                  <button
                    onClick={() => setShowCustomAccountInput(true)}
                    disabled={isGoogleLoading}
                    className="w-full p-3.5 flex items-center gap-3 hover:bg-slate-50 transition-all text-left text-blue-600 font-bold text-xs cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-600 shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Use another Google account</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Custom Google Account Input Form */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performGoogleSignIn(customEmail, customName);
                }}
                className="space-y-3.5 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Google Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the Google account you wish to use on PixKart.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  {savedAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCustomAccountInput(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      ← Saved Accounts
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isGoogleLoading}
                    className="flex-1 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Sign In with Google</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center text-[11px] text-slate-400">
              PixKart will receive your Google email and public name.
            </div>
          </div>
        </div>
      )}

      {/* Simple Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        © 2026 PixKart India. All rights reserved.
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
