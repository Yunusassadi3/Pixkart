"use client";

import React, { useState } from "react";
import { useApp, isUdupiPincode, UDUPI_UNDELIVERABLE_MESSAGE, UserAddress } from "@/context/AppContext";
import {
  MapPin,
  ChevronDown,
  Zap,
  Plus,
  Check,
  Trash2,
  X,
  Home,
  Briefcase,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function AddressBar() {
  const {
    addresses,
    activeAddress,
    activeAddressId,
    setActiveAddressId,
    saveUserAddress,
    deleteUserAddress,
    addressModalOpen,
    setAddressModalOpen,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for new address
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !streetAddress.trim() || !pincode.trim()) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (!isUdupiPincode(pincode)) {
      setFormError(UDUPI_UNDELIVERABLE_MESSAGE);
      return;
    }

    const newAddr: UserAddress = {
      id: `addr_${Date.now()}`,
      type: addressType,
      name: name.trim(),
      phone: phone.trim(),
      address: streetAddress.trim(),
      city: city.trim() || "Delivery City",
      state: "Karnataka",
      pincode: pincode.trim(),
      isDefault: false,
    };

    const success = saveUserAddress(newAddr);
    if (success) {
      setFormError(null);
      setShowAddForm(false);
      setName("");
      setPhone("");
      setStreetAddress("");
      setCity("");
      setPincode("");
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "Work":
        return <Briefcase className="w-3.5 h-3.5 text-blue-600" />;
      case "Other":
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <>
      {/* Dynamic Address Bar (Placed directly above the Search Bar) */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
          
          {/* Deliver To Address Dropdown Button */}
          <button
            onClick={() => setAddressModalOpen(true)}
            className="flex items-center gap-1.5 min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
            title="Switch or Add Delivery Address"
          >
            <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-blue-600" />
            </div>

            <span className="font-extrabold text-slate-900 uppercase text-[10px] sm:text-[11px] shrink-0 bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded">
              {activeAddress?.type || "DELIVERY"}
            </span>

            <span className="text-slate-700 truncate text-[11px] sm:text-xs font-medium">
              {activeAddress?.address ? `${activeAddress.address}, ${activeAddress.city} - ${activeAddress.pincode}` : "Select or add your delivery address"}
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {/* SuperCoins / Rewards Points Pill */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-300/80 px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-900 shrink-0">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>0</span>
          </div>

        </div>
      </div>

      {/* Address Switcher & Multi-Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Choose Delivery Address
                </h3>
                <p className="text-xs text-slate-500">
                  Select where you want your order delivered in Udupi City & Manipal
                </p>
              </div>
              <button
                onClick={() => {
                  setAddressModalOpen(false);
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notice */}
            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}

            {/* Address List */}
            {!showAddForm && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Saved Addresses ({addresses.length})
                  </span>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setFormError(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {addresses.map((addr) => {
                  const isSelected = addr.id === activeAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setActiveAddressId(addr.id);
                        setAddressModalOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {addr.name}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                              {getIcon(addr.type)} {addr.type || "HOME"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">
                            {addr.address}, {addr.city} - <span className="font-mono font-bold text-slate-900">{addr.pincode}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Phone: {addr.phone}
                          </p>
                        </div>
                      </div>

                      {addresses.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteUserAddress(addr.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                <div className="pt-2">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-slate-50 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" /> + Add New Delivery Address
                  </button>
                </div>
              </div>
            )}

            {/* Add New Address Form */}
            {showAddForm && (
              <form onSubmit={handleAddNewAddress} className="mt-4 space-y-3.5">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    New Address Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mohammed Yunus"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Flat / House / Apartment / Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 207 second floor golden plaza appartment near old taluk office"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / Locality *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter City"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit Pincode"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    {(["Home", "Work", "Other"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddressType(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          addressType === t
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all"
                  >
                    Save & Deliver Here
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
