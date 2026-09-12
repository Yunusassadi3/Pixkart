"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApp, SpotlightBrand, HeroSlide, PromoAdCard } from "@/context/AppContext";
import { formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/lib/data/orders";
import { Product } from "@/lib/data/products";
import { categories, Category } from "@/lib/data/categories";
import { brands, Brand } from "@/lib/data/brands";
import { PhoneModel } from "@/lib/data/models";
import BrandLogo from "@/components/icons/BrandLogos";
import PixKartLogo from "@/components/common/PixKartLogo";
import {
  Lock,
  LogOut,
  PackageCheck,
  Truck,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  Box,
  TrendingUp,
  AlertTriangle,
  X,
  MapPin,
  Check,
  Printer,
  Download,
  Megaphone,
  BarChart3,
  Upload,
  Tag,
  ShieldCheck,
  Smartphone,
  Layers,
  Image as ImageIcon,
  Settings,
  RotateCcw,
  Save,
  FileText,
  Database,
  Cloud,
  RefreshCw,
  Server,
  Sparkles,
  Sliders,
  Eye,
  ArrowRight,
} from "lucide-react";

const ORDER_STATUSES: OrderStatus[] = [
  "Ordered",
  "Packed",
  "Shipped",
  "On the Way",
  "Out for Delivery",
  "Delivered",
];

const ALL_STATUS_FILTERS: (OrderStatus | "all")[] = [
  "all",
  "Ordered",
  "Packed",
  "Shipped",
  "On the Way",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const PRESET_CATEGORY_LOGOS = [
  { id: "cases", label: "Back Covers", image: "/images/categories/category-1-cases.png", icon: "📱" },
  { id: "glass", label: "Screen Guards", image: "/images/categories/category-2-screen-guards.png", icon: "💎" },
  { id: "tws", label: "Earphones & TWS", image: "/images/categories/category-3-earphones-tws.png", icon: "🎧" },
  { id: "headphones", label: "Headphones", image: "/images/categories/category-4-headphones.png", icon: "🎧" },
  { id: "chargers", label: "Fast Chargers", image: "/images/categories/category-5-chargers.png", icon: "⚡" },
  { id: "smartwatches", label: "Smartwatches", image: "/images/categories/category-6-smartwatches.png", icon: "⌚" },
  { id: "speakers", label: "Speakers", image: "/images/categories/category-7-speakers.png", icon: "📻" },
  { id: "cables", label: "Cables & Adapters", image: "/images/categories/category-8-cables.png", icon: "🔌" },
  { id: "camera", label: "Camera Glass", image: "/images/categories/category-9-camera-protectors.png", icon: "📷" },
  { id: "holders", label: "Car & Desk Mounts", image: "/images/categories/category-10-holders.png", icon: "🚗" },
  { id: "magsafe", label: "MagSafe Wallets", image: "/images/categories/category-11-magsafe.png", icon: "🧲" },
  { id: "custom", label: "PixKart Icon", image: "/images/custom-category-icon.png", icon: "✨" },
];

const DEFAULT_SHIPPING_LABEL_CONFIG = {
  headerTitle: "PIXKART EXPRESS",
  subtitle: "Official Mobile Accessories website",
  shipFromName: "PixKart online udupi",
  shipFromAddress: "Main Road, Udupi City, Karnataka - 576101",
  supportContact: "+91 99000 00000",
  barcodeText: "||||| ||||||| |||| |||||||| |||||",
  footerNote: "Official PixKart Verified Dispatch | Cash On Delivery",
};

export default function AdminPage() {
  const {
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    ordersList,
    updateOrderStatus,
    productsList,
    addProduct,
    updateProduct,
    deleteProduct,
    categoriesList,
    addCategory,
    updateCategory,
    deleteCategory,
    brandsList,
    addBrand,
    deleteBrand,
    phoneModelsList,
    addPhoneModel,
    deletePhoneModel,
    spotlightBrandsList,
    addSpotlightBrand,
    updateSpotlightBrand,
    deleteSpotlightBrand,
    heroSlidesList,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    promoAdBannersList,
    addPromoAd,
    updatePromoAd,
    deletePromoAd,
    toggleProductSpotlight,
    toggleProductHeroBanner,
    toggleProductPromoBanner,
    toggleProductFeatured,
    toggleProductDealOfDay,
    syncLocalProductsToCloud,
  } = useApp();

  const [passcodeInput, setPasscodeInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);
  const [productSaveSuccess, setProductSaveSuccess] = useState<string | null>(null);
  const [isSyncingMobileLocal, setIsSyncingMobileLocal] = useState(false);
  const [mobileSyncMsg, setMobileSyncMsg] = useState<string | null>(null);

  // Require passcode unlock every time the Admin page is opened
  useEffect(() => {
    logoutAdmin();
    return () => {
      logoutAdmin();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    "orders" | "products" | "categories" | "brands" | "spotlight" | "banners" | "featured" | "deals" | "overview"
  >("orders");
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Database & 24/7 Cloud Auto-Sync State
  const [dbHealth, setDbHealth] = useState<{
    status: string;
    host?: string;
    database?: string;
    latencyMs?: number;
    local?: {
      status: string;
      host: string;
      database: string;
      latencyMs?: number;
    };
    cloud?: {
      status: string;
      host: string;
      database: string;
      latencyMs?: number;
    };
    tableCounts?: Record<string, number>;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const fetchDbHealthAndSync = async () => {
    try {
      const res = await fetch("/api/db/health");
      const data = await res.json();
      setDbHealth(data);
    } catch {}

    setIsSyncing(true);
    try {
      const syncRes = await fetch("/api/orders/sync-and-drain", { method: "POST" });
      const syncData = await syncRes.json();
      if (syncData.success) {
        const catalogCount = syncData.catalogSyncedCount || 0;
        const orderCount = syncData.ordersSyncedCount !== undefined ? syncData.ordersSyncedCount : (syncData.syncedCount || 0);
        const userCount = syncData.usersSyncedCount || 0;
        const total = catalogCount + orderCount + userCount;
        if (total > 0) {
          setSyncStatusMsg(`✓ Ingested & 3-step verified ${catalogCount} catalog asset(s), ${orderCount} offline order(s), and ${userCount} offline user(s). TiDB Cloud server storage cleaned to 0 KB!`);
        } else {
          setSyncStatusMsg("✓ Master database verified. TiDB Cloud server storage is clean (0 KB).");
        }
      }
      try {
        const res2 = await fetch("/api/db/health");
        const data2 = await res2.json();
        setDbHealth(data2);
      } catch {}
    } catch (err: any) {
      setSyncStatusMsg("Offline mode active. Local records preserved.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchDbHealthAndSync();
    }
  }, [isAdminAuthenticated]);

  // Category Form State
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "📱",
    image: "",
    tagline: "",
    description: "",
    color: "#2874F0",
    featured: true,
  });
  const [categoryImageUrlInput, setCategoryImageUrlInput] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categoriesList;
    const q = categorySearchQuery.toLowerCase();
    return categoriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.tagline?.toLowerCase().includes(q)
    );
  }, [categoriesList, categorySearchQuery]);

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      icon: "📱",
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&auto=format&fit=crop&q=80",
      tagline: "",
      description: "",
      color: "#2874F0",
      featured: true,
    });
    setCategoryImageUrlInput("");
    setAddCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "📱",
      image: cat.image || "",
      tagline: cat.tagline || "",
      description: cat.description || "",
      color: cat.color || "#2874F0",
      featured: cat.featured ?? true,
    });
    setCategoryImageUrlInput(cat.image || "");
    setAddCategoryModalOpen(true);
  };

  /**
   * Ultra-compact canvas image compression for mobile & Netlify uploads.
   * Shrinks photos to max 900px and 0.70 JPEG quality (~40KB-70KB output).
   * For files <= 5MB, processes completely silently with no messages shown.
   */
  const compressImageFile = (file: File, maxDim = 900, quality = 0.70): Promise<string> => {
    return new Promise((resolve) => {
      if (!file) return resolve("");

      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Files <= 5MB are compressed silently with no message
    const compressed = await compressImageFile(file, 800, 0.70);
    if (compressed) {
      setCategoryForm((prev) => ({ ...prev, image: compressed }));
    }
    e.target.value = "";
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const id = editingCategory
      ? editingCategory.id
      : (categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

    const newCategory: Category = {
      id,
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim() || id,
      icon: categoryForm.icon.trim() || "📱",
      image: categoryForm.image.trim() || "/images/back-covers-logo.png",
      tagline: categoryForm.tagline.trim() || categoryForm.name.trim(),
      description: categoryForm.description.trim() || `Shop the latest ${categoryForm.name} accessories.`,
      color: categoryForm.color || "#2874F0",
      gradient: "from-blue-900/40 to-indigo-900/20",
      featured: categoryForm.featured,
    };

    if (editingCategory) {
      updateCategory(newCategory);
    } else {
      addCategory(newCategory);
    }

    setAddCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Brand Form State
  const [addBrandModalOpen, setAddBrandModalOpen] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    slug: "",
    logo: "📱",
    categoryType: "all" as "phone" | "audio" | "accessory" | "all",
    color: "#2874F0",
    featured: true,
  });

  // Mobile Model Form & Search State
  const [modelSearchQuery, setModelSearchQuery] = useState("");
  const [modelBrandFilter, setModelBrandFilter] = useState("all");
  const [addModelModalOpen, setAddModelModalOpen] = useState(false);
  const [modelForm, setModelForm] = useState({
    brandId: "apple",
    series: "",
    name: "",
    displaySize: "",
    releaseYear: new Date().getFullYear(),
  });

  const filteredPhoneModels = useMemo(() => {
    return phoneModelsList.filter((m) => {
      if (modelBrandFilter !== "all" && m.brandId !== modelBrandFilter) {
        return false;
      }
      if (modelSearchQuery.trim()) {
        const q = modelSearchQuery.toLowerCase();
        const brandName = brandsList.find((b) => b.id === m.brandId)?.name.toLowerCase() || "";
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesSeries = m.series.toLowerCase().includes(q);
        const matchesBrand = brandName.includes(q) || m.brandId.toLowerCase().includes(q);
        return matchesName || matchesSeries || matchesBrand;
      }
      return true;
    });
  }, [phoneModelsList, modelBrandFilter, modelSearchQuery, brandsList]);

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name) return;
    const id = brandForm.slug || brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newBrand: Brand = {
      id,
      name: brandForm.name,
      slug: id,
      logo: brandForm.logo || "📱",
      categoryType: brandForm.categoryType,
      color: brandForm.color || "#2874F0",
      featured: brandForm.featured,
    };
    addBrand(newBrand);
    setAddBrandModalOpen(false);
    setBrandForm({
      name: "",
      slug: "",
      logo: "📱",
      categoryType: "all",
      color: "#2874F0",
      featured: true,
    });
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelForm.name || !modelForm.series || !modelForm.brandId) return;

    const id = modelForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newModel: PhoneModel = {
      id,
      brandId: modelForm.brandId,
      series: modelForm.series.trim(),
      name: modelForm.name.trim(),
      slug: id,
      releaseYear: Number(modelForm.releaseYear) || new Date().getFullYear(),
      displaySize: modelForm.displaySize.trim() || undefined,
    };

    addPhoneModel(newModel);
    setAddModelModalOpen(false);
    setModelForm({
      brandId: "apple",
      series: "",
      name: "",
      displaySize: "",
      releaseYear: new Date().getFullYear(),
    });
  };

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Shipping Label Editor State
  const [shippingLabelConfig, setShippingLabelConfig] = useState(DEFAULT_SHIPPING_LABEL_CONFIG);
  const [isEditingShippingLabel, setIsEditingShippingLabel] = useState(false);
  const [labelEditorForm, setLabelEditorForm] = useState(DEFAULT_SHIPPING_LABEL_CONFIG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pixkart_shipping_label_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setShippingLabelConfig((prev) => ({ ...prev, ...parsed }));
        setLabelEditorForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load shipping label config:", e);
    }
  }, []);

  const saveShippingLabelConfig = (newConfig: typeof DEFAULT_SHIPPING_LABEL_CONFIG) => {
    setShippingLabelConfig(newConfig);
    setLabelEditorForm(newConfig);
    try {
      localStorage.setItem("pixkart_shipping_label_config", JSON.stringify(newConfig));
    } catch (e) {
      console.error("Failed to save shipping label config:", e);
    }
    setIsEditingShippingLabel(false);
  };

  const handlePrintShippingLabel = (order: Order) => {
    try {
      const printWindow = window.open("", "_blank", "width=850,height=950");
      if (!printWindow) {
        window.print();
        return;
      }

      const itemsHtml = order.items
        .map(
          (it) => `
        <tr style="border-bottom: 1px dashed #cbd5e1;">
          <td style="padding: 7px 4px; font-weight: 600; color: #0f172a; font-size: 11px;">
            ${it.quantity}x ${it.productTitle}
          </td>
          <td style="padding: 7px 4px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a; font-size: 11px; white-space: nowrap;">
            ${formatPrice(it.price * it.quantity)}
          </td>
        </tr>
      `
        )
        .join("");

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Shipping_Label_${order.id}</title>
            <style>
              @page {
                size: auto;
                margin: 15mm 10mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                color: #0f172a;
                margin: 0;
                padding: 24px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
                box-sizing: border-box;
              }
              .shipping-label-card {
                width: 100%;
                max-width: 440px;
                border: 2px solid #0f172a;
                border-radius: 12px;
                padding: 18px;
                background-color: #ffffff;
                box-sizing: border-box;
              }
              .header-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 10px;
                margin-bottom: 12px;
              }
              .brand-title {
                font-size: 20px;
                font-weight: 900;
                font-style: italic;
                color: #0f172a;
                margin: 0;
                letter-spacing: -0.5px;
              }
              .brand-subtitle {
                font-size: 10px;
                color: #64748b;
                margin: 2px 0 0 0;
                font-weight: 600;
              }
              .order-id {
                font-size: 14px;
                font-family: monospace;
                font-weight: 900;
                color: #1d4ed8;
                margin: 0;
                text-align: right;
              }
              .order-date {
                font-size: 10px;
                color: #64748b;
                font-family: monospace;
                text-align: right;
                margin-top: 2px;
              }
              .barcode-box {
                background-color: #f8fafc;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 7px;
                text-align: center;
                font-family: monospace;
                font-size: 14px;
                letter-spacing: 4px;
                font-weight: 900;
                margin-bottom: 12px;
                color: #0f172a;
              }
              .address-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 12px;
              }
              .address-box {
                padding: 10px;
                border-radius: 8px;
                font-size: 11px;
                line-height: 1.35;
                box-sizing: border-box;
              }
              .ship-from {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
              }
              .deliver-to {
                background-color: #eff6ff;
                border: 1px solid #bfdbfe;
              }
              .addr-label {
                font-size: 9px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
                display: block;
              }
              .ship-from .addr-label { color: #64748b; }
              .deliver-to .addr-label { color: #1d4ed8; }
              .addr-name {
                font-weight: 800;
                color: #0f172a;
                font-size: 12px;
                margin-bottom: 3px;
              }
              .addr-body {
                color: #334155;
                font-size: 10.5px;
              }
              .pincode-badge {
                font-weight: 800;
                color: #1d4ed8;
                font-size: 11px;
                margin-top: 4px;
                display: block;
              }
              .phone-text {
                font-size: 10px;
                color: #475569;
                font-family: monospace;
                margin-top: 2px;
              }
              .items-section {
                border-top: 1px solid #e2e8f0;
                border-bottom: 1px solid #e2e8f0;
                padding: 8px 0;
                margin-bottom: 10px;
              }
              .section-label {
                font-size: 9px;
                font-weight: 900;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 13px;
                font-weight: 900;
                color: #0f172a;
                margin-bottom: 8px;
              }
              .total-amount {
                font-size: 16px;
                color: #1d4ed8;
                font-family: monospace;
              }
              .footer-note {
                border-top: 1px solid #e2e8f0;
                padding-top: 8px;
                text-align: center;
                font-size: 9px;
                color: #64748b;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            <div class="shipping-label-card">
              <div class="header-row">
                <div>
                  <h1 class="brand-title">${shippingLabelConfig.headerTitle || "PIXKART EXPRESS"}</h1>
                  <p class="brand-subtitle">${shippingLabelConfig.subtitle || "Official Mobile Accessories website"}</p>
                </div>
                <div>
                  <div class="order-id">${order.id}</div>
                  <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div class="barcode-box">
                ${shippingLabelConfig.barcodeText || "||||| ||||||| |||| |||||||| |||||"}
              </div>

              <div class="address-grid">
                <div class="address-box ship-from">
                  <span class="addr-label">SHIP FROM:</span>
                  <div class="addr-name">${shippingLabelConfig.shipFromName || "PixKart online udupi"}</div>
                  <div class="addr-body">${shippingLabelConfig.shipFromAddress || "Main Road, Udupi City, Karnataka - 576101"}</div>
                  ${shippingLabelConfig.supportContact ? `<div class="phone-text">Support: ${shippingLabelConfig.supportContact}</div>` : ""}
                </div>

                <div class="address-box deliver-to">
                  <span class="addr-label">DELIVER TO:</span>
                  <div class="addr-name">${order.customerName}</div>
                  <div class="addr-body">${order.address}</div>
                  <div class="pincode-badge">Pincode: ${order.pincode}</div>
                  <div class="phone-text">Ph: ${order.phone}</div>
                </div>
              </div>

              <div class="items-section">
                <div class="section-label">ITEMS LIST:</div>
                <table class="items-table">
                  <tbody>${itemsHtml}</tbody>
                </table>
              </div>

              <div class="total-row">
                <span>Total Amount (COD):</span>
                <span class="total-amount">${formatPrice(order.totalAmount)}</span>
              </div>

              <div class="footer-note">
                ${shippingLabelConfig.footerNote || "Official PixKart Verified Dispatch | Cash On Delivery"}
              </div>
            </div>

            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    } catch (e) {
      window.print();
    }
  };

  const orderedPendingOrders = useMemo(() => {
    return ordersList.filter((o) => o.status === "Ordered" || (o.status as string) === "Order Placed");
  }, [ordersList]);

  const handlePrintAllPendingLabels = () => {
    if (orderedPendingOrders.length === 0) {
      alert("There are no orders currently in 'Ordered' status to print. Shipping labels are only printed for pending new orders.");
      return;
    }

    try {
      const printWindow = window.open("", "_blank", "width=900,height=1000");
      if (!printWindow) {
        alert("Please allow popups in your browser to print batch shipping labels.");
        return;
      }

      // Group orders into chunks of 4 for A4 pages (2x2 grid per page)
      const chunkSize = 4;
      const pages: Order[][] = [];
      for (let i = 0; i < orderedPendingOrders.length; i += chunkSize) {
        pages.push(orderedPendingOrders.slice(i, i + chunkSize));
      }

      const pagesHtml = pages
        .map((pageOrders) => {
          const labelsHtml = pageOrders
            .map((order) => {
              const itemsListHtml = (order.items && order.items.length > 0)
                ? order.items
                    .map(
                      (it) => `
                    <tr style="border-bottom: 1px dashed #cbd5e1;">
                      <td style="padding: 2.5px 2px; font-weight: 600; color: #0f172a; font-size: 8.5px; line-height: 1.15;">
                        ${it.quantity}x ${it.productTitle}${it.modelName ? ` (${it.modelName})` : ""}
                      </td>
                      <td style="padding: 2.5px 2px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a; font-size: 8.5px; white-space: nowrap;">
                        ${formatPrice(it.price * it.quantity)}
                      </td>
                    </tr>
                  `
                    )
                    .join("")
                : `
                    <tr style="border-bottom: 1px dashed #cbd5e1;">
                      <td colspan="2" style="padding: 2.5px 2px; font-style: italic; color: #64748b; font-size: 8.5px;">
                        1x Standard Verified Accessory Package
                      </td>
                    </tr>
                  `;

              return `
                <div class="label-card">
                  <!-- Header -->
                  <div class="header-row">
                    <div>
                      <h2 class="brand-title">${shippingLabelConfig.headerTitle || "PIXKART EXPRESS"}</h2>
                      <p class="brand-subtitle">${shippingLabelConfig.subtitle || "Official Mobile Accessories website"}</p>
                    </div>
                    <div style="text-align: right;">
                      <div class="order-id">${order.id}</div>
                      <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <!-- Barcode -->
                  <div class="barcode-box">
                    ${shippingLabelConfig.barcodeText || "||||| ||||||| |||| |||||||| |||||"}
                  </div>

                  <!-- Addresses -->
                  <div class="address-grid">
                    <div class="address-box ship-from">
                      <span class="addr-label">SHIP FROM:</span>
                      <div class="addr-name">${shippingLabelConfig.shipFromName || "PixKart online udupi"}</div>
                      <div class="addr-body">${shippingLabelConfig.shipFromAddress || "Main Road, Udupi City, Karnataka - 576101"}</div>
                      ${shippingLabelConfig.supportContact ? `<div class="phone-text">Supp: ${shippingLabelConfig.supportContact}</div>` : ""}
                    </div>

                    <div class="address-box deliver-to">
                      <span class="addr-label">DELIVER TO:</span>
                      <div class="addr-name">${order.customerName}</div>
                      <div class="addr-body">${order.address}</div>
                      <div class="pincode-badge">Pincode: ${order.pincode}</div>
                      <div class="phone-text">Ph: ${order.phone}</div>
                    </div>
                  </div>

                  <!-- Items Table -->
                  <div class="items-section">
                    <div class="section-label">ITEMS LIST:</div>
                    <table class="items-table">
                      <tbody>${itemsListHtml}</tbody>
                    </table>
                  </div>

                  <!-- Total -->
                  <div class="total-row">
                    <span>Total (COD):</span>
                    <span class="total-amount">${formatPrice(order.totalAmount)}</span>
                  </div>

                  <!-- Footer -->
                  <div class="footer-note">
                    ${shippingLabelConfig.footerNote || "Official PixKart Verified Dispatch | Cash On Delivery"}
                  </div>
                </div>
              `;
            })
            .join("");

          return `
            <div class="a4-page">
              ${labelsHtml}
            </div>
          `;
        })
        .join("");

      const printDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Batch_Shipping_Labels_A4 (${orderedPendingOrders.length}_Orders)</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 5mm;
              }
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #ffffff;
                color: #0f172a;
                margin: 0;
                padding: 0;
              }
              .a4-page {
                width: 100%;
                height: 100vh;
                max-height: 284mm;
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                gap: 4mm;
                page-break-after: always;
                break-after: page;
                padding: 2mm;
                box-sizing: border-box;
              }
              .a4-page:last-child {
                page-break-after: auto;
                break-after: auto;
              }
              .label-card {
                border: 1.5px solid #0f172a;
                border-radius: 8px;
                padding: 8px 10px;
                background: #ffffff;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
              }
              .header-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 1.5px solid #0f172a;
                padding-bottom: 4px;
                margin-bottom: 4px;
              }
              .brand-title {
                font-size: 13px;
                font-weight: 900;
                font-style: italic;
                color: #0f172a;
                margin: 0;
                letter-spacing: -0.3px;
                line-height: 1.1;
              }
              .brand-subtitle {
                font-size: 8px;
                color: #64748b;
                margin: 1px 0 0 0;
                font-weight: 600;
                line-height: 1;
              }
              .order-id {
                font-size: 11px;
                font-family: monospace;
                font-weight: 900;
                color: #1d4ed8;
                margin: 0;
                line-height: 1;
              }
              .order-date {
                font-size: 8px;
                color: #64748b;
                font-family: monospace;
                margin-top: 1px;
              }
              .barcode-box {
                background-color: #f8fafc;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 2px 4px;
                text-align: center;
                font-family: monospace;
                font-size: 9px;
                letter-spacing: 2.5px;
                font-weight: 900;
                margin-bottom: 4px;
                color: #0f172a;
              }
              .address-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
                margin-bottom: 4px;
              }
              .address-box {
                padding: 5px;
                border-radius: 6px;
                font-size: 8.5px;
                line-height: 1.25;
                box-sizing: border-box;
              }
              .ship-from {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
              }
              .deliver-to {
                background-color: #eff6ff;
                border: 1px solid #bfdbfe;
              }
              .addr-label {
                font-size: 7.5px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                margin-bottom: 2px;
                display: block;
              }
              .ship-from .addr-label { color: #64748b; }
              .deliver-to .addr-label { color: #1d4ed8; }
              .addr-name {
                font-weight: 800;
                color: #0f172a;
                font-size: 9.5px;
                margin-bottom: 2px;
                line-height: 1.1;
              }
              .addr-body {
                color: #334155;
                font-size: 8px;
                line-height: 1.15;
              }
              .pincode-badge {
                font-weight: 800;
                color: #1d4ed8;
                font-size: 8.5px;
                margin-top: 2px;
                display: block;
              }
              .phone-text {
                font-size: 8px;
                color: #475569;
                font-family: monospace;
                margin-top: 1px;
              }
              .items-section {
                border-top: 1px solid #e2e8f0;
                border-bottom: 1px solid #e2e8f0;
                padding: 3px 0;
                margin-bottom: 3px;
                flex: 1;
                overflow: hidden;
              }
              .section-label {
                font-size: 7.5px;
                font-weight: 900;
                text-transform: uppercase;
                color: #64748b;
                letter-spacing: 0.3px;
                margin-bottom: 2px;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10.5px;
                font-weight: 900;
                color: #0f172a;
                padding: 2px 0;
              }
              .total-amount {
                font-size: 12px;
                color: #1d4ed8;
                font-family: monospace;
              }
              .footer-note {
                border-top: 1px solid #e2e8f0;
                padding-top: 3px;
                text-align: center;
                font-size: 7.5px;
                color: #64748b;
                font-family: monospace;
              }
            </style>
          </head>
          <body>
            ${pagesHtml}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.close();
                }, 600);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printDoc);
      printWindow.document.close();
    } catch (err) {
      console.error("Print all error:", err);
      window.print();
    }
  };

  const [imageUrlInput, setImageUrlInput] = useState("");

  // Form State for Product Add/Edit
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    categoryId: "cases-covers",
    brandId: "apple",
    basePrice: 499,
    mrp: 999,
    discountPercent: 50,
    imageUrlsList: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80"
    ] as string[],
    badgeText: "Bestseller",
    description: "High quality premium mobile accessory.",
    inSpotlight: false,
    inHeroBanner: false,
    inPromoBanner: false,
    isFeatured: false,
    isDealOfDay: false,
  });

  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      slug: "",
      categoryId: "cases-covers",
      brandId: "apple",
      basePrice: 499,
      mrp: 999,
      discountPercent: 50,
      imageUrlsList: [
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80"
      ],
      badgeText: "Bestseller",
      description: "High quality premium mobile accessory.",
      inSpotlight: false,
      inHeroBanner: false,
      inPromoBanner: false,
      isFeatured: false,
      isDealOfDay: false,
    });
    setImageUrlInput("");
    setAddModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImage(true);
    try {
      const compressedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // If file size is <= 5MB, process completely silently with zero messages
        const compressed = await compressImageFile(file, 900, 0.70);
        if (compressed) compressedUrls.push(compressed);
      }
      setFormData((prev) => ({
        ...prev,
        imageUrlsList: [...prev.imageUrlsList, ...compressedUrls],
      }));
    } finally {
      setIsCompressingImage(false);
      e.target.value = "";
    }
  };

  const handleAddUrlImage = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      imageUrlsList: [...prev.imageUrlsList, trimmed],
    }));
    setImageUrlInput("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrlsList: prev.imageUrlsList.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passcodeInput);
    if (!success) {
      setLoginError(true);
    } else {
      setLoginError(false);
    }
  };

  // Export CSV Report Function
  const exportOrdersCSV = () => {
    const headers = ["Order ID", "Customer Name", "Phone", "Address", "Pincode", "Total Amount (INR)", "Status", "Date Created"];
    const rows = ordersList.map((o) => [
      o.id,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      o.pincode,
      o.totalAmount,
      o.status,
      `"${new Date(o.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pixkart_orders_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaveError(null);
    setProductSaveSuccess(null);
    setIsSavingProduct(true);

    try {
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      const finalImages = formData.imageUrlsList.length > 0 
        ? formData.imageUrlsList 
        : ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80"];

      const newProd: Product = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        title: formData.title,
        slug,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        basePrice: Number(formData.basePrice),
        mrp: Number(formData.mrp),
        discountPercent: Math.round(((formData.mrp - formData.basePrice) / formData.mrp) * 100),
        rating: editingProduct ? editingProduct.rating : 4.8,
        reviewCount: editingProduct ? editingProduct.reviewCount : 120,
        description: formData.description,
        features: ["Premium Build Quality", "Official Brand Warranty", "100% Fit Guarantee"],
        specs: { Material: "Premium Polycarbonate", Warranty: "1 Year" },
        imageUrls: finalImages,
        badgeText: formData.badgeText,
        inSpotlight: formData.inSpotlight,
        inHeroBanner: formData.inHeroBanner,
        inPromoBanner: formData.inPromoBanner,
        isFeatured: formData.isFeatured,
        isDealOfDay: formData.isDealOfDay,
      };

      let result;
      if (editingProduct) {
        result = await updateProduct(newProd);
      } else {
        result = await addProduct(newProd);
      }

      if (result && !result.success) {
        setProductSaveError(result.message || "Failed to save product to database.");
        setIsSavingProduct(false);
        return;
      }

      setProductSaveSuccess("✓ Product saved successfully to master database & cloud queue!");
      setTimeout(() => {
        setProductSaveSuccess(null);
        setAddModalOpen(false);
        setEditingProduct(null);
      }, 750);

      setFormData({
        title: "",
        slug: "",
        categoryId: "cases-covers",
        brandId: "apple",
        basePrice: 499,
        mrp: 999,
        discountPercent: 50,
        imageUrlsList: [
          "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80"
        ],
        badgeText: "Bestseller",
        description: "High quality premium mobile accessory.",
        inSpotlight: false,
        inHeroBanner: false,
        inPromoBanner: false,
        isFeatured: false,
        isDealOfDay: false,
      });
      setImageUrlInput("");
    } catch (err: any) {
      setProductSaveError(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      slug: prod.slug,
      categoryId: prod.categoryId,
      brandId: prod.brandId,
      basePrice: prod.basePrice,
      mrp: prod.mrp,
      discountPercent: prod.discountPercent,
      imageUrlsList: prod.imageUrls && prod.imageUrls.length > 0 ? [...prod.imageUrls] : [],
      badgeText: prod.badgeText || "",
      description: prod.description || "",
      inSpotlight: !!prod.inSpotlight,
      inHeroBanner: !!prod.inHeroBanner,
      inPromoBanner: !!prod.inPromoBanner,
      isFeatured: !!prod.isFeatured,
      isDealOfDay: !!prod.isDealOfDay,
    });
    setImageUrlInput("");
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((ord) => {
      const normStatus = ((ord.status as string) === "Order Placed" || !ord.status) ? "Ordered" : ord.status;
      const matchesQuery =
        !searchQuery.trim() ||
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.phone?.includes(searchQuery) ||
        ord.pincode.includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Ordered" ? normStatus === "Ordered" : ord.status === statusFilter);
      return matchesQuery && matchesStatus;
    });
  }, [ordersList, searchQuery, statusFilter]);

  // Filtered Products
  const filteredProducts = productsList.filter((prod) =>
    prod.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats Calculations
  const totalRevenue = ordersList.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const activeOrdersCount = ordersList.filter(
    (ord) => ord.status !== "Delivered" && ord.status !== "Cancelled"
  ).length;
  const deliveredOrdersCount = ordersList.filter((ord) => ord.status === "Delivered").length;
  const avgOrderValue = ordersList.length > 0 ? Math.round(totalRevenue / ordersList.length) : 0;

  // -------------------------------------------------------------
  // BRAND IN SPOTLIGHT STATE & HANDLERS
  // -------------------------------------------------------------
  const [spotlightModalOpen, setSpotlightModalOpen] = useState(false);
  const [editingSpotlight, setEditingSpotlight] = useState<SpotlightBrand | null>(null);
  const [spotlightForm, setSpotlightForm] = useState<SpotlightBrand>({
    id: "",
    brandName: "",
    tagline: "SMART",
    badge: "AD",
    headline: "From ₹499",
    subtext: "Nitro charging",
    image: "",
    bgColor: "bg-[#f5ede4] text-slate-900 border-orange-100",
    link: "/shop",
  });

  const openNewSpotlightModal = () => {
    setEditingSpotlight(null);
    setSpotlightForm({
      id: `spotlight-${Date.now()}`,
      brandName: "",
      tagline: "SMART",
      badge: "AD",
      headline: "From ₹499",
      subtext: "Nitro charging",
      image: "/images/categories/category-1-cases.png",
      bgColor: "bg-[#f5ede4] text-slate-900 border-orange-100",
      link: "/shop",
    });
    setSpotlightModalOpen(true);
  };

  const handleSpotlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotlightForm.brandName || !spotlightForm.headline) return;

    if (editingSpotlight) {
      updateSpotlightBrand(spotlightForm);
    } else {
      addSpotlightBrand({
        ...spotlightForm,
        id: spotlightForm.id || `spotlight-${Date.now()}`,
      });
    }
    setSpotlightModalOpen(false);
  };

  const handleSpotlightFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const compressed = await compressImageFile(files[0], 900, 0.70);
    if (compressed) {
      setSpotlightForm((prev) => ({ ...prev, image: compressed }));
    }
    e.target.value = "";
  };

  // -------------------------------------------------------------
  // HERO BANNER SLIDES STATE & HANDLERS
  // -------------------------------------------------------------
  const [heroSlideModalOpen, setHeroSlideModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);
  const [heroSlideForm, setHeroSlideForm] = useState<HeroSlide>({
    id: "",
    brandPrefix: "APPLE",
    brandTag: "SERIES",
    badgeLabel: "PixKart Unique",
    title: "iPhone 16 Gear",
    priceText: "From ₹299",
    saleDateText: "Udupi COD Available Now",
    featureText: "iPhone 16 / 15 Series",
    bgGradient: "from-[#d1e5fc] via-[#e2eefb] to-[#f2f8ff]",
    link: "/shop",
    phoneFrontImage: "",
  });

  const openNewHeroSlideModal = () => {
    setEditingHeroSlide(null);
    setHeroSlideForm({
      id: `hero-${Date.now()}`,
      brandPrefix: "APPLE",
      brandTag: "SERIES",
      badgeLabel: "PixKart Unique",
      title: "iPhone 16 Gear",
      priceText: "From ₹299",
      saleDateText: "Udupi COD Available Now",
      featureText: "iPhone 16 / 15 Series",
      bgGradient: "from-[#d1e5fc] via-[#e2eefb] to-[#f2f8ff]",
      link: "/shop",
      phoneFrontImage: "/images/categories/category-1-cases.png",
    });
    setHeroSlideModalOpen(true);
  };

  const handleHeroSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSlideForm.title) return;

    if (editingHeroSlide) {
      updateHeroSlide(heroSlideForm);
    } else {
      addHeroSlide({
        ...heroSlideForm,
        id: heroSlideForm.id || `hero-${Date.now()}`,
      });
    }
    setHeroSlideModalOpen(false);
  };

  const handleHeroSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const compressed = await compressImageFile(files[0], 900, 0.70);
    if (compressed) {
      setHeroSlideForm((prev) => ({ ...prev, phoneFrontImage: compressed }));
    }
    e.target.value = "";
  };

  // -------------------------------------------------------------
  // PROMO AD BANNERS STATE & HANDLERS
  // -------------------------------------------------------------
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromoAd, setEditingPromoAd] = useState<PromoAdCard | null>(null);
  const [promoForm, setPromoForm] = useState<PromoAdCard>({
    id: "",
    brandTag: "CASES",
    brandTagColor: "bg-amber-400 text-black",
    badge: "DEALS",
    title: "ARMOR & MAGSAFE",
    subtitle: "Military Drop Protection for All Brands",
    price: "From ₹299*",
    image: "",
    bgGradient: "bg-[#18181b] text-white border-zinc-800",
    link: "/shop",
  });

  const openNewPromoModal = () => {
    setEditingPromoAd(null);
    setPromoForm({
      id: `promo-${Date.now()}`,
      brandTag: "CASES",
      brandTagColor: "bg-amber-400 text-black",
      badge: "DEALS",
      title: "ARMOR & MAGSAFE",
      subtitle: "Military Drop Protection for All Brands",
      price: "From ₹299*",
      image: "/images/categories/category-1-cases.png",
      bgGradient: "bg-[#18181b] text-white border-zinc-800",
      link: "/shop",
    });
    setPromoModalOpen(true);
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title) return;

    if (editingPromoAd) {
      updatePromoAd(promoForm);
    } else {
      addPromoAd({
        ...promoForm,
        id: promoForm.id || `promo-${Date.now()}`,
      });
    }
    setPromoModalOpen(false);
  };

  const handlePromoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const compressed = await compressImageFile(files[0], 900, 0.70);
    if (compressed) {
      setPromoForm((prev) => ({ ...prev, image: compressed }));
    }
    e.target.value = "";
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN FOR UNAUTHENTICATED ADMINS
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-3 flex flex-col items-center">
            <PixKartLogo size="lg" theme="amber" />
            <h1 className="text-xl font-black font-display tracking-tight text-white pt-1">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400">
              Restricted portal for authorized store administrators only.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                Invalid admin passcode. Please enter the correct password.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm py-3.5 rounded-xl transition-all shadow-lg active:scale-98"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 text-center text-xs text-slate-500">
            Protected Admin Portal Access
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. MAIN ADMIN DASHBOARD INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans pb-20">
      {/* Admin Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <PixKartLogo size="sm" theme="amber" />
            </Link>
            <span className="bg-slate-800 text-amber-400 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              ADMIN CONTROL CENTER
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-300 hover:text-white transition-colors hidden sm:inline"
            >
              ← Back to Storefront
            </Link>
            <button
              onClick={logoutAdmin}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="bg-slate-800 border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <PackageCheck className="w-4 h-4" /> Live Order Tracking ({ordersList.length})
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "products"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Box className="w-4 h-4" /> Products Catalog ({productsList.length})
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "categories"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" /> Categories ({categoriesList.length})
            </button>

            <button
              onClick={() => setActiveTab("brands")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "brands"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Tag className="w-4 h-4" /> Brands ({brandsList.length})
            </button>

            <button
              onClick={() => setActiveTab("spotlight")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "spotlight"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" /> Brands in Spotlight ({productsList.filter((p) => p.inSpotlight).length})
            </button>

            <button
              onClick={() => setActiveTab("banners")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "banners"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" /> Hero & Promo Banners ({productsList.filter((p) => p.inHeroBanner || p.inPromoBanner).length})
            </button>

            <button
              onClick={() => setActiveTab("featured")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "featured"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <span>🔥</span> Featured Accessories ({productsList.filter((p) => p.isFeatured).length})
            </button>

            <button
              onClick={() => setActiveTab("deals")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "deals"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <span>⚡</span> Flash Deals ({productsList.filter((p) => p.isDealOfDay).length})
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-amber-400 text-amber-400 bg-slate-900/50"
                  : "border-transparent text-slate-300 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics & Storage Cleanup
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        
        {/* Live MySQL 8.0 Master & 24/7 TiDB Cloud Status Bar */}
        <div className="hidden md:flex bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  MySQL 8.0 Master
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    dbHealth?.status === "connected" || dbHealth?.local?.status === "connected"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      dbHealth?.status === "connected" || dbHealth?.local?.status === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {dbHealth?.status === "connected" || dbHealth?.local?.status === "connected" ? "100% Connected" : "PC Offline (Buffering to Cloud)"}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono hidden sm:inline">
                  {dbHealth?.local?.host || "localhost:3306"}
                </span>

                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    TiDB Cloud 24/7 Buffer
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {syncStatusMsg || (dbHealth?.status === "connected" || dbHealth?.local?.status === "connected"
                  ? "✓ Local PC MySQL Master is active on your machine. Ready for 3-Step ACID Sync & Drain."
                  : "⚡ PC is offline or in background. All mobile updates & orders are automatically buffered in TiDB Cloud.")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">Cloud Buffers:</span>
              <span className="font-bold text-emerald-400">
                {(dbHealth?.tableCounts?.cloudQueuePending || 0) + (dbHealth?.tableCounts?.cloudUserQueuePending || 0)} Pending
              </span>
              <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2 hidden sm:inline">
                📦 {dbHealth?.tableCounts?.cloudQueuePending || 0} Orders | 👤 {dbHealth?.tableCounts?.cloudUserQueuePending || 0} Users
              </span>
            </div>

            <button
              onClick={fetchDbHealthAndSync}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync & Drain"}</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900">
                {formatPrice(totalRevenue)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Orders
              </span>
              <span className="text-lg sm:text-2xl font-black text-amber-600">
                {activeOrdersCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Delivered Orders
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-600">
                {deliveredOrdersCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Average Order Value
              </span>
              <span className="text-lg sm:text-2xl font-black text-purple-600">
                {formatPrice(avgOrderValue)}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: LIVE ORDER TRACKING & STATUS STEPPER WORKFLOW
           ------------------------------------------------------------- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Storage Auto-Cleanup Banner */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start justify-between gap-3 text-xs text-blue-900 shadow-xs flex-wrap">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-950">
                    🧹 Storage Maintenance & 7-Day Auto-Cleanup Engine Active
                  </h4>
                  <p className="mt-0.5 leading-relaxed text-blue-800">
                    To keep storage lightweight and unbloated, all orders marked as <strong>Delivered</strong> will be <strong>automatically deleted 7 days after delivery</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Shipping Label Editor Button */}
                <button
                  onClick={() => {
                    setLabelEditorForm(shippingLabelConfig);
                    setIsEditingShippingLabel(true);
                  }}
                  className="bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Configure Dispatch Label & Store Information"
                >
                  <Settings className="w-4 h-4 text-blue-600" /> Edit Label Info
                </button>

                {/* CSV Export Button */}
                <button
                  onClick={exportOrdersCSV}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" /> Export CSV Report
                </button>
              </div>
            </div>

            {/* Action Row Between the Two Boxes */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrintAllPendingLabels}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                title="Print shipping labels for all orders currently in 'Ordered' state (4 labels per A4 page)"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Labels</span>
                <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {orderedPendingOrders.length}
                </span>
              </button>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Prints only pending &quot;Ordered&quot; status labels (4 per A4 page)
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Customer Name, or Pincode..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs font-bold text-slate-600 shrink-0">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses ({ordersList.length})</option>
                  {ALL_STATUS_FILTERS.filter((s) => s !== "all").map((st) => (
                    <option key={st} value={st}>
                      {st} ({
                        st === "Ordered"
                          ? ordersList.filter((o) => o.status === "Ordered" || (o.status as string) === "Order Placed").length
                          : ordersList.filter((o) => o.status === st).length
                      })
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders List with Stepper Buttons */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-2">
                <div className="text-4xl">📦</div>
                <h3 className="text-base font-bold text-slate-800">No orders found</h3>
                <p className="text-xs">Try clearing search filters or check customer orders.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const normalizeStatus = (status: string): OrderStatus => {
                    if (!status || status === "Order Placed" || status === "Ordered") return "Ordered";
                    return status as OrderStatus;
                  };

                  const currentNormStatus = normalizeStatus(order.status);
                  const currentStatusIdx = ORDER_STATUSES.indexOf(currentNormStatus);
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-blue-300"
                    >
                      {/* Top Header of Order */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                              {order.id}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            Customer: {order.customerName} ({order.phone})
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {order.address} ({order.pincode})
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition-all"
                            title="Print Shipping Invoice / Dispatch Label"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-700" /> Shipping Label
                          </button>
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">Total Amount</span>
                            <span className="text-lg font-black text-slate-900">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Ordered List - Click to View Full Details */}
                      <div className="flex flex-wrap gap-2.5 py-1.5">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                const matched = productsList.find((p) => p.id === item.productId) || {
                                  id: item.productId,
                                  title: item.productTitle,
                                  slug: item.productId,
                                  categoryId: "cases-covers",
                                  brandId: "apple",
                                  basePrice: item.price,
                                  mrp: Math.round(item.price * 1.5),
                                  discountPercent: 33,
                                  rating: 4.8,
                                  reviewCount: 12,
                                  description: "Ordered customer product accessory from PixKart catalog.",
                                  features: ["100% Genuine Fit", "PixKart Verified Quality"],
                                  specs: { Model: item.modelName || "Standard Universal Fit" },
                                  imageUrls: [
                                    item.productImage ||
                                      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80",
                                  ],
                                  stockStatus: "in_stock",
                                } as Product;
                                setInspectProduct(matched);
                              }}
                              className="bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-400 rounded-xl p-2.5 flex items-center gap-3 text-xs shadow-2xs transition-all cursor-pointer group"
                              title="Click to view full product details"
                            >
                              <img
                                src={item.productImage || "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80"}
                                alt={item.productTitle}
                                className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 group-hover:scale-105 transition-transform"
                              />
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-blue-600 block max-w-[220px] truncate leading-tight transition-colors">
                                  {item.productTitle}
                                </span>
                                {item.modelName && (
                                  <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
                                    Model: {item.modelName}
                                  </span>
                                )}
                                <span className="text-slate-600 text-[11px] font-medium block mt-0.5">
                                  Qty: <strong className="text-slate-900">{item.quantity}</strong> × {formatPrice(item.price)}
                                </span>
                                <span className="text-[9px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                                  <Eye className="w-2.5 h-2.5" /> Click for full details
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic py-1 flex items-center gap-1.5">
                            <span>📦 Verified PixKart Order Package</span>
                          </div>
                        )}
                      </div>

                      {/* LIVE ORDER STATUS STEPPER BUTTONS */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-600" /> Update Order Tracking Status:
                          </span>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              currentNormStatus === "Delivered"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : currentNormStatus === "Cancelled"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            Current: {currentNormStatus}
                          </span>
                        </div>

                        {/* Interactive Status Stepper Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                          {ORDER_STATUSES.map((st, sIdx) => {
                            const isCurrent = currentNormStatus === st;
                            const isPassed = currentNormStatus !== "Cancelled" && sIdx < currentStatusIdx;

                            let btnClasses = "";
                            if (isCurrent) {
                              if (st === "Delivered") {
                                // Delivered button clicked: Solid Blue
                                btnClasses = "bg-[#2874f0] text-white border-blue-600 shadow-md ring-2 ring-blue-400/40 font-black scale-102";
                              } else {
                                // Any other status button clicked: Solid Vibrant Green
                                btnClasses = "bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40 font-black scale-102";
                              }
                            } else if (isPassed) {
                              // Automatically converted previous buttons: Normal Blue
                              btnClasses = "bg-blue-600 text-white border-blue-700 font-bold hover:bg-blue-700";
                            } else {
                              // Future unclicked steps: Neutral White
                              btnClasses = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium";
                            }

                            return (
                              <button
                                key={st}
                                onClick={() => updateOrderStatus(order.id, st)}
                                className={`py-2.5 px-3 rounded-full text-xs transition-all duration-200 flex items-center justify-center gap-1.5 border shadow-2xs ${btnClasses}`}
                              >
                                {(isCurrent || isPassed) && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                                <span className="truncate">{st}</span>
                              </button>
                            );
                          })}

                          {/* Cancelled Button for Admin */}
                          <button
                            key="Cancelled"
                            onClick={() => {
                              if (confirm(`Are you sure you want to mark Order #${order.id} as Cancelled?`)) {
                                updateOrderStatus(order.id, "Cancelled");
                              }
                            }}
                            className={`py-2.5 px-3 rounded-full text-xs transition-all duration-200 flex items-center justify-center gap-1.5 border shadow-2xs ${
                              currentNormStatus === "Cancelled"
                                ? "bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40 font-black scale-102"
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 font-bold"
                            }`}
                            title="Cancel Order"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                            <span className="truncate">Cancelled</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: PRODUCTS MANAGEMENT (ADD, EDIT, DELETE & STOCK)
           ------------------------------------------------------------- */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Mobile / Local Browser Sync Helper Banner */}
            {productsList.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2874f0] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <span>Products Loaded in Browser ({productsList.length})</span>
                      {dbHealth?.tableCounts?.products !== undefined && (
                        <span className="text-[10px] text-slate-500 font-normal">
                          (Master DB has {dbHealth.tableCounts.products})
                        </span>
                      )}
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      Added products from this mobile device or browser? Click sync to immediately save all products to Master MySQL &amp; TiDB Cloud.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {mobileSyncMsg && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-lg">
                      {mobileSyncMsg}
                    </span>
                  )}
                  <button
                    onClick={async () => {
                      setIsSyncingMobileLocal(true);
                      setMobileSyncMsg(null);
                      try {
                        const res = await syncLocalProductsToCloud();
                        setMobileSyncMsg(`✓ Synced ${res.synced}/${res.total} to Database!`);
                        setTimeout(() => setMobileSyncMsg(null), 6000);
                      } catch {
                        setMobileSyncMsg("❌ Sync failed. Please retry.");
                      } finally {
                        setIsSyncingMobileLocal(false);
                      }
                    }}
                    disabled={isSyncingMobileLocal}
                    className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMobileLocal ? "animate-spin" : ""}`} />
                    <span>{isSyncingMobileLocal ? "Syncing..." : "Sync All to Database & Cloud"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog products by title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={openNewProductModal}
                className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Price / MRP</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <img
                            src={prod.imageUrls[0]}
                            alt={prod.title}
                            className="w-10 h-10 object-cover rounded-lg border bg-slate-50 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1 block">
                              {prod.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {prod.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {prod.categoryId}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700 uppercase">
                        {prod.brandId}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatPrice(prod.basePrice)}{" "}
                        <span className="text-slate-400 line-through text-[11px] font-normal">
                          {formatPrice(prod.mrp)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {prod.badgeText ? (
                          <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded">
                            {prod.badgeText}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${prod.title}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: CATEGORIES MANAGEMENT (ADD, EDIT, DELETE, IMAGE UPLOAD)
           ------------------------------------------------------------- */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Action Header */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2874f0]" /> Category Catalog & Ribbon Management
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Manage categories shown across the store ribbon, shop filters, and navigation. Change logo images or upload your own files.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={openNewCategoryModal}
                  className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add New Category
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search categories by name, slug, or tagline..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-xs font-bold text-slate-500 shrink-0 pr-2">
                Showing {filteredCategories.length} of {categoriesList.length} categories
              </span>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((cat) => {
                const count = productsList.filter((p) => p.categoryId === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group hover:border-blue-400"
                  >
                    <div className="flex items-start gap-3">
                      {/* Category High-Res Logo / Image Display */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden p-1.5 group-hover:border-blue-400 group-hover:bg-blue-50/40 transition-all">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                          />
                        ) : (
                          <span className="text-2xl sm:text-3xl">{cat.icon || "📱"}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                            {cat.name}
                          </h4>
                          {cat.featured && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300/60 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-tight">
                              Ribbon
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          /{cat.slug}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 font-medium leading-tight">
                          {cat.tagline || cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-blue-200/60">
                        {count} {count === 1 ? "Product" : "Products"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 transition-colors font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Edit Category & Change Logo"
                        >
                          <Edit className="w-3 h-3" /> Change Logo / Edit
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: BRANDS MANAGEMENT
           ------------------------------------------------------------- */}
        {activeTab === "brands" && (
          <div className="space-y-6">
            {/* Action Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Brand Catalog Management</h3>
                <p className="text-slate-500 text-xs">Manage mobile & accessory partner brands available in store.</p>
              </div>

              <button
                onClick={() => setAddBrandModalOpen(true)}
                className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Brand
              </button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandsList.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 p-1 shadow-2xs overflow-hidden">
                      <BrandLogo brandId={brand.id} logo={brand.logo} name={brand.name} className="h-7 w-auto max-w-[90%] object-contain" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-xs truncate">{brand.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                          {brand.categoryType}
                        </span>
                        {brand.featured && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
                        deleteBrand(brand.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile Phone Series & Models Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#2874f0]" /> Mobile Phone Series & Models Catalog ({phoneModelsList.length})
                  </h3>
                  <p className="text-slate-500 text-xs">Add series (e.g. Nord Series, Galaxy S24) and exact phone models for each brand.</p>
                </div>

                <button
                  onClick={() => setAddModelModalOpen(true)}
                  className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Mobile Model / Series
                </button>
              </div>

              {/* Models Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    placeholder="Search phone models by exact name, series, or brand (e.g. iPhone 16 Pro, Nord 4, Galaxy S24 Ultra)..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                  />
                  {modelSearchQuery && (
                    <button
                      onClick={() => setModelSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={modelBrandFilter}
                  onChange={(e) => setModelBrandFilter(e.target.value)}
                  className="w-full sm:w-48 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-bold shadow-2xs"
                >
                  <option value="all">All Brands ({phoneModelsList.length})</option>
                  {brandsList
                    .filter((b) => b.categoryType === "phone" || b.categoryType === "all")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Counter Badge */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
                <span>
                  Showing <strong className="text-slate-900">{filteredPhoneModels.length}</strong> of {phoneModelsList.length} mobile models
                </span>
                {(modelSearchQuery || modelBrandFilter !== "all") && (
                  <button
                    onClick={() => {
                      setModelSearchQuery("");
                      setModelBrandFilter("all");
                    }}
                    className="text-blue-600 hover:underline font-bold text-xs"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Models List Table */}
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">Series Name</th>
                      <th className="py-2.5 px-3">Exact Phone Model</th>
                      <th className="py-2.5 px-3">Display & Year</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredPhoneModels.map((m) => {
                      const brand = brandsList.find((b) => b.id === m.brandId);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-7 h-6 bg-slate-100 rounded-md border border-slate-200/90 flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
                              <BrandLogo brandId={m.brandId} logo={brand?.logo} name={brand?.name} className="h-4 w-auto object-contain" />
                            </div>
                            <span className="font-extrabold">{brand?.name || m.brandId}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded text-[11px] border border-blue-200/60">
                              {m.series}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {m.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {m.displaySize || "Standard"} ({m.releaseYear})
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete model "${m.name}"?`)) {
                                  deletePhoneModel(m.id);
                                }
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Model"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: BRANDS IN SPOTLIGHT (VIEW & MANAGE PROMOTIONS)
           ------------------------------------------------------------- */}
        {activeTab === "spotlight" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> Brands in Spotlight Manager
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Products currently active in the 3-column &quot;Brands in Spotlight&quot; section. To add products here, check <span className="font-bold text-amber-600">&quot;Feature in Brands in Spotlight&quot;</span> when adding or editing a product in the Products Catalog.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("products")}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-slate-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Box className="w-4 h-4" /> Go to Products Catalog
              </button>
            </div>

            {/* Active Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Active Spotlight Products</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {productsList.filter((p) => p.inSpotlight).length}
                  </span>
                </h4>
              </div>

              {productsList.filter((p) => p.inSpotlight).length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-3xl">✨</p>
                  <h4 className="text-sm font-bold text-slate-700">No products in Spotlight yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When you add or edit a product, simply check the box <strong className="text-amber-700">&quot;Feature in Brands in Spotlight&quot;</strong> and it will automatically appear here and on the storefront!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Remove from Spotlight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsList
                        .filter((p) => p.inSpotlight)
                        .map((prod) => {
                          const brandObj = brandsList.find((b) => b.id === prod.brandId);
                          const catObj = categoriesList.find((c) => c.id === prod.categoryId);
                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={prod.imageUrls?.[0] || "/images/custom-category-icon.png"}
                                      alt={prod.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{prod.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                                  {brandObj?.name || prod.brandId}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-600">
                                {catObj?.name || prod.categoryId}
                              </td>

                              <td className="py-3 px-4 font-black text-slate-900">
                                {formatPrice(prod.basePrice)}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => toggleProductSpotlight(prod.id, false)}
                                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                                  title="Remove from Brands in Spotlight"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: HERO & PROMO AD BANNERS (VIEW & MANAGE PROMOTIONS)
           ------------------------------------------------------------- */}
        {activeTab === "banners" && (
          <div className="space-y-8">
            {/* 1. TOP HERO BANNER SLIDER PRODUCTS */}
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-blue-600" /> Top Hero Banner Slider (Above Precision Finder)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Products currently rotating in the main top hero banner. To feature products here, check <span className="font-bold text-blue-600">&quot;Feature in Top Hero Banner Slider&quot;</span> when adding or editing products in the Products Catalog.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("products")}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-slate-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Box className="w-4 h-4" /> Go to Products Catalog
                </button>
              </div>

              {productsList.filter((p) => p.inHeroBanner).length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-3xl">📢</p>
                  <p className="text-xs font-bold text-slate-700">No products explicitly marked for Top Hero Banner.</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    The store currently auto-slides through the latest catalog products or displays the official PixKart welcome banner. Check &quot;Feature in Top Hero Banner Slider&quot; on any product to feature it here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList
                    .filter((p) => p.inHeroBanner)
                    .map((prod) => {
                      const brandObj = brandsList.find((b) => b.id === prod.brandId);
                      return (
                        <div
                          key={prod.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black uppercase text-slate-900">
                                  {brandObj?.name || prod.brandId}
                                </span>
                                {prod.badgeText && (
                                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {prod.badgeText}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black text-slate-900 line-clamp-1">{prod.title}</h4>
                              <p className="text-xs font-black text-slate-900">{formatPrice(prod.basePrice)}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold">
                                {prod.discountPercent > 0 ? `${prod.discountPercent}% OFF` : "COD Available"}
                              </p>
                            </div>

                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={prod.imageUrls?.[0] || "/images/placeholder.png"}
                                alt={prod.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[60%]">
                              /shop/{prod.slug}
                            </span>
                            <button
                              onClick={() => toggleProductHeroBanner(prod.id, false)}
                              className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
                              title="Remove from Hero Slider"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 2. COMPACT PROMO AD BANNERS */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-600" /> Compact Promo Ad Banners (Below Device Finder)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Products featured as dark, vibrant promo ad cards below the device finder. To feature products here, check <span className="font-bold text-indigo-600">&quot;Feature in Promo Ad Banners&quot;</span> in the Products Catalog.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("products")}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all border border-slate-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Box className="w-4 h-4" /> Go to Products Catalog
                </button>
              </div>

              {productsList.filter((p) => p.inPromoBanner).length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-3xl">🏷️</p>
                  <p className="text-xs font-bold text-slate-700">No products selected for Promo Ad Banners.</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Check &quot;Feature in Promo Ad Banners&quot; when adding or editing a product to display it in the dark promo cards section.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList
                    .filter((p) => p.inPromoBanner)
                    .map((prod) => {
                      const brandObj = brandsList.find((b) => b.id === prod.brandId);
                      return (
                        <div
                          key={prod.id}
                          className="rounded-2xl p-4 border shadow-sm space-y-3 flex flex-col justify-between bg-[#18181b] text-white border-zinc-800"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-400 text-black">
                                  {brandObj?.name || prod.brandId}
                                </span>
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                                  {prod.discountPercent > 0 ? `${prod.discountPercent}% OFF` : prod.badgeText || "DEALS"}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-black text-white line-clamp-1">{prod.title}</h4>
                              <p className="text-[10px] text-white/70 line-clamp-1">{prod.description}</p>
                              <p className="text-xs font-black text-white">{formatPrice(prod.basePrice)}</p>
                            </div>

                            <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/10 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={prod.imageUrls?.[0] || "/images/custom-category-icon.png"}
                                alt={prod.title}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-white/60 truncate max-w-[60%]">
                              /shop/{prod.slug}
                            </span>
                            <button
                              onClick={() => toggleProductPromoBanner(prod.id, false)}
                              className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold text-xs px-2.5 py-1 rounded-lg border border-red-500/30 transition-colors cursor-pointer"
                              title="Remove from Promo Banners"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: FEATURED MOBILE ACCESSORIES (VIEW & MANAGE)
           ------------------------------------------------------------- */}
        {activeTab === "featured" && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span className="text-lg">🔥</span> Featured Mobile Accessories (Homepage Section)
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Products currently displayed in the popular featured accessories section on the homepage. To feature products here, check <span className="font-bold text-emerald-600">&quot;Feature in Featured Mobile Accessories&quot;</span> when adding or editing in the Products Catalog.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("products")}
                className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add / Feature Products
              </button>
            </div>

            {/* Active Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Active Featured Products</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {productsList.filter((p) => p.isFeatured).length}
                  </span>
                </h4>
              </div>

              {productsList.filter((p) => p.isFeatured).length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-3xl">🔥</p>
                  <h4 className="text-sm font-bold text-slate-700">No products in Featured Section yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When you add or edit a product, simply check the box <strong className="text-emerald-700">&quot;Feature in Featured Mobile Accessories&quot;</strong> and it will automatically appear here and on the storefront!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Remove from Featured</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsList
                        .filter((p) => p.isFeatured)
                        .map((prod) => {
                          const brandObj = brandsList.find((b) => b.id === prod.brandId);
                          const catObj = categoriesList.find((c) => c.id === prod.categoryId);
                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={prod.imageUrls?.[0] || "/images/custom-category-icon.png"}
                                      alt={prod.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{prod.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                                  {brandObj?.name || prod.brandId}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-600">
                                {catObj?.name || prod.categoryId}
                              </td>

                              <td className="py-3 px-4 font-black text-slate-900">
                                {formatPrice(prod.basePrice)}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => toggleProductFeatured(prod.id, false)}
                                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                                  title="Remove from Featured Section"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: FLASH DEALS / DEALS OF THE DAY (VIEW & MANAGE)
           ------------------------------------------------------------- */}
        {activeTab === "deals" && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span className="text-lg">⚡</span> Flash Deals & Deals of the Day (Countdown Section)
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Products highlighted in the countdown flash deals section. To feature products here, check <span className="font-bold text-red-600">&quot;Feature in Flash Deals / Deals of the Day&quot;</span> in the Products Catalog.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("products")}
                className="w-full sm:w-auto bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add / Feature Deals
              </button>
            </div>

            {/* Active Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Active Flash Deals Products</span>
                  <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {productsList.filter((p) => p.isDealOfDay).length}
                  </span>
                </h4>
              </div>

              {productsList.filter((p) => p.isDealOfDay).length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-3xl">⚡</p>
                  <h4 className="text-sm font-bold text-slate-700">No products in Flash Deals yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When you add or edit a product, simply check the box <strong className="text-red-700">&quot;Feature in Flash Deals / Deals of the Day&quot;</strong> and it will automatically appear here and on the storefront!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Remove from Flash Deals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsList
                        .filter((p) => p.isDealOfDay)
                        .map((prod) => {
                          const brandObj = brandsList.find((b) => b.id === prod.brandId);
                          const catObj = categoriesList.find((c) => c.id === prod.categoryId);
                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={prod.imageUrls?.[0] || "/images/custom-category-icon.png"}
                                      alt={prod.title}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{prod.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase">
                                  {brandObj?.name || prod.brandId}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-600">
                                {catObj?.name || prod.categoryId}
                              </td>

                              <td className="py-3 px-4 font-black text-slate-900">
                                {formatPrice(prod.basePrice)}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => toggleProductDealOfDay(prod.id, false)}
                                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
                                  title="Remove from Flash Deals"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB: ANALYTICS & STORAGE MAINTENANCE
           ------------------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">System Storage & Cleanup Policy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The PixKart Admin Engine implements automated storage optimization. Orders marked as <strong>Delivered</strong> are retained for exactly 7 days to allow for customer queries, after which they are automatically purged from local storage to ensure high performance and prevent browser storage limits.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs space-y-2 text-slate-800">
                <div className="flex justify-between">
                  <span>Delivered Orders Auto-Purge Window:</span>
                  <span className="font-bold text-emerald-600">7 Days (168 Hours)</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Active Orders:</span>
                  <span className="font-bold text-blue-600">{activeOrdersCount} Orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Storage Health:</span>
                  <span className="font-bold text-emerald-600">100% Optimal</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          PRINTABLE SHIPPING LABEL / DISPATCH INVOICE MODAL
         ------------------------------------------------------------- */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0 print:max-h-none print:overflow-visible print:bg-white">
            <div className="flex items-center justify-between border-b pb-3 print:hidden">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" /> Dispatch Shipping Label
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLabelEditorForm(shippingLabelConfig);
                    setIsEditingShippingLabel(!isEditingShippingLabel);
                  }}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                    isEditingShippingLabel
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  }`}
                  title="Edit Admin Sender Information & Template"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingShippingLabel ? "View Label" : "Edit Label Info"}</span>
                </button>
                <button
                  onClick={() => {
                    setInvoiceOrder(null);
                    setIsEditingShippingLabel(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode A: In-Place Label Editor */}
            {isEditingShippingLabel ? (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-blue-600" /> Shipping Label & Sender Editor
                  </span>
                  <button
                    type="button"
                    onClick={() => setLabelEditorForm(DEFAULT_SHIPPING_LABEL_CONFIG)}
                    className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Defaults
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Customize the sender address, store title, and notes printed on all shipping labels.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company / Brand Header</label>
                    <input
                      type="text"
                      value={labelEditorForm.headerTitle}
                      onChange={(e) => setLabelEditorForm({ ...labelEditorForm, headerTitle: e.target.value })}
                      placeholder="e.g. PIXKART EXPRESS"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={labelEditorForm.subtitle}
                      onChange={(e) => setLabelEditorForm({ ...labelEditorForm, subtitle: e.target.value })}
                      placeholder="e.g. Official Mobile Accessories website"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ship From (Hub / Business Name)</label>
                  <input
                    type="text"
                    value={labelEditorForm.shipFromName}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, shipFromName: e.target.value })}
                    placeholder="e.g. PixKart online udupi"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ship From Full Address</label>
                  <textarea
                    rows={2}
                    value={labelEditorForm.shipFromAddress}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, shipFromAddress: e.target.value })}
                    placeholder="e.g. Main Road, Udupi City, Karnataka - 576101"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Support Contact / Phone</label>
                    <input
                      type="text"
                      value={labelEditorForm.supportContact}
                      onChange={(e) => setLabelEditorForm({ ...labelEditorForm, supportContact: e.target.value })}
                      placeholder="e.g. +91 99000 00000"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Footer Dispatch Note</label>
                    <input
                      type="text"
                      value={labelEditorForm.footerNote}
                      onChange={(e) => setLabelEditorForm({ ...labelEditorForm, footerNote: e.target.value })}
                      placeholder="e.g. Official PixKart Verified Dispatch | Cash On Delivery"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingShippingLabel(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveShippingLabelConfig(labelEditorForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" /> Save & Apply
                  </button>
                </div>
              </div>
            ) : (
              /* Mode B: High-Precision Printable Shipping Label */
              <div id="pixkart-printable-shipping-label" className="border-2 border-slate-800 p-4 rounded-xl font-sans text-xs space-y-3 bg-white shadow-xs">
                {/* Header Row */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-2.5">
                  <div>
                    <h4 className="font-black text-lg italic text-slate-950 tracking-tight">
                      {shippingLabelConfig.headerTitle}
                    </h4>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {shippingLabelConfig.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-blue-700 text-sm block">
                      {invoiceOrder.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(invoiceOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Barcode Mock */}
                <div className="bg-slate-50 p-2 rounded-lg text-center font-mono text-xs tracking-widest border border-slate-300 font-black text-slate-900 select-none">
                  {shippingLabelConfig.barcodeText}
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-black text-slate-500 uppercase text-[9px] block tracking-wider mb-0.5">
                      SHIP FROM:
                    </span>
                    <p className="font-bold text-slate-950 text-xs">{shippingLabelConfig.shipFromName}</p>
                    <p className="text-slate-700 text-[10px] leading-tight mt-0.5 whitespace-pre-line">
                      {shippingLabelConfig.shipFromAddress}
                    </p>
                    {shippingLabelConfig.supportContact && (
                      <p className="text-slate-500 text-[9px] mt-1 font-mono">
                        Support: {shippingLabelConfig.supportContact}
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-200">
                    <span className="font-black text-blue-700 uppercase text-[9px] block tracking-wider mb-0.5">
                      DELIVER TO:
                    </span>
                    <p className="font-bold text-slate-950 text-xs">{invoiceOrder.customerName}</p>
                    <p className="text-slate-700 text-[10px] leading-tight mt-0.5">
                      {invoiceOrder.address}
                    </p>
                    <p className="font-black text-blue-700 text-xs mt-1">
                      Pincode: {invoiceOrder.pincode}
                    </p>
                    <p className="text-slate-700 text-[10px] font-mono mt-0.5">
                      Ph: {invoiceOrder.phone}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="border-t border-b border-slate-200 py-2 space-y-1">
                  <span className="font-black text-slate-500 uppercase text-[9px] block tracking-wider">
                    ITEMS LIST:
                  </span>
                  {invoiceOrder.items && invoiceOrder.items.length > 0 ? (
                    invoiceOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-900 py-0.5">
                        <span className="font-medium">
                          <strong>{it.quantity}x</strong> {it.productTitle}
                          {it.modelName ? ` (${it.modelName})` : ""}
                        </span>
                        <span className="font-mono font-bold">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-0.5">
                      1x Standard Verified Accessory Package
                    </div>
                  )}
                </div>

                {/* Total & Payment Mode */}
                <div className="flex justify-between items-center font-black text-sm pt-0.5">
                  <span className="text-slate-900">Total Amount (COD):</span>
                  <span className="font-mono text-blue-700 text-base">{formatPrice(invoiceOrder.totalAmount)}</span>
                </div>

                {/* Footer Note */}
                <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500 font-mono">
                  {shippingLabelConfig.footerNote}
                </div>
              </div>
            )}

            {!isEditingShippingLabel && (
              <div className="flex gap-2 justify-end items-center pt-2 print:hidden">
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintShippingLabel(invoiceOrder)}
                  className="bg-[#2874f0] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Label
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STANDALONE SHIPPING LABEL & SENDER EDITOR MODAL
         ------------------------------------------------------------- */}
      {isEditingShippingLabel && !invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" /> Shipping Label & Admin Info Editor
              </h3>
              <button
                onClick={() => setIsEditingShippingLabel(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Configure the sender details, store title, and hub address that appear on all printed dispatch labels.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand Header</label>
                  <input
                    type="text"
                    value={labelEditorForm.headerTitle}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, headerTitle: e.target.value })}
                    placeholder="e.g. PIXKART EXPRESS"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={labelEditorForm.subtitle}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, subtitle: e.target.value })}
                    placeholder="e.g. Official Mobile Accessories website"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ship From (Hub / Business Name)</label>
                <input
                  type="text"
                  value={labelEditorForm.shipFromName}
                  onChange={(e) => setLabelEditorForm({ ...labelEditorForm, shipFromName: e.target.value })}
                  placeholder="e.g. PixKart online udupi"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ship From Full Address</label>
                <textarea
                  rows={2}
                  value={labelEditorForm.shipFromAddress}
                  onChange={(e) => setLabelEditorForm({ ...labelEditorForm, shipFromAddress: e.target.value })}
                  placeholder="e.g. Main Road, Udupi City, Karnataka - 576101"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Contact / Helpline</label>
                  <input
                    type="text"
                    value={labelEditorForm.supportContact}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, supportContact: e.target.value })}
                    placeholder="e.g. +91 99000 00000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Footer Dispatch Note</label>
                  <input
                    type="text"
                    value={labelEditorForm.footerNote}
                    onChange={(e) => setLabelEditorForm({ ...labelEditorForm, footerNote: e.target.value })}
                    placeholder="e.g. Official PixKart Verified Dispatch | Cash On Delivery"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sample Live Preview Box */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-300">
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Sample Live Preview (Header & Hub):
                </span>
                <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-sans">
                  <div className="flex justify-between items-start border-b pb-1.5">
                    <div>
                      <h4 className="font-black italic text-sm text-slate-950">
                        {labelEditorForm.headerTitle || "PIXKART EXPRESS"}
                      </h4>
                      <p className="text-[9px] text-slate-600">
                        {labelEditorForm.subtitle || "Official Mobile Accessories website"}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-blue-600">ORD-SAMPLE-101</span>
                  </div>
                  <div className="pt-1.5 text-[10px]">
                    <span className="font-bold text-slate-500 text-[8px] block">SHIP FROM:</span>
                    <p className="font-bold text-slate-900">{labelEditorForm.shipFromName || "PixKart online udupi"}</p>
                    <p className="text-slate-600">{labelEditorForm.shipFromAddress || "Main Road, Udupi City, Karnataka - 576101"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setLabelEditorForm(DEFAULT_SHIPPING_LABEL_CONFIG)}
                  className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingShippingLabel(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveShippingLabelConfig(labelEditorForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Label Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ADD / EDIT PRODUCT MODAL
         ------------------------------------------------------------- */}
      {(addModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                {editingProduct ? "Edit Product Details" : "Add New Mobile Accessory"}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {productSaveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-semibold">{productSaveError}</span>
                </div>
              )}
              {productSaveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{productSaveSuccess}</span>
                </div>
              )}
              {isCompressingImage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="font-semibold">Optimizing photo dimensions for instant cloud sync...</span>
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 120W GaN Fast Charger"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Brand</label>
                    <button
                      type="button"
                      onClick={() => setAddBrandModalOpen(true)}
                      className="text-[10px] text-[#2874f0] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Add Brand
                    </button>
                  </div>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  >
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Product Images (Upload file OR URL input, multiple allowed) */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Product Images ({formData.imageUrlsList.length} Added)
                </label>

                {/* Thumbnails Gallery */}
                {formData.imageUrlsList.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                    {formData.imageUrlsList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-white shrink-0 group"
                      >
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#2874f0] text-white text-[8px] font-black text-center py-0.5 uppercase tracking-wide">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload or URL Inputs */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-[#2874f0] font-bold border border-blue-200 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 transition-colors shadow-2xs">
                      <Upload className="w-4 h-4" />
                      <span>Upload Image File(s)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-400 text-xs font-semibold uppercase">OR</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrlImage();
                        }
                      }}
                      placeholder="Paste image web URL (e.g. https://...)"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add URL</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  You can upload files directly from your computer/device or paste image URLs. Multiple photos allowed (the first photo is used as main thumbnail).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Text (Optional)</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  placeholder="e.g. Lowest price, Bestseller, New Arrival"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>

              {/* Promotion & Home Screen Placement Section */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                    Home Screen Visibility & Promotion Placement
                  </h4>
                </div>
                <p className="text-[11px] text-amber-900 leading-tight">
                  Directly choose which promotional frames this product should appear in:
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 bg-white border border-amber-200/80 rounded-xl p-2.5 cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.inSpotlight}
                      onChange={(e) => setFormData({ ...formData, inSpotlight: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        ✨ Feature in &quot;Brands in Spotlight&quot; (3-Column Grid)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Displays this product in the 3-column spotlight frame under its brand.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 bg-white border border-amber-200/80 rounded-xl p-2.5 cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.inHeroBanner}
                      onChange={(e) => setFormData({ ...formData, inHeroBanner: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        📢 Feature in &quot;Top Hero Banner Slider&quot; (Top Main Carousel)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Features this product in the main top slider above the device finder.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 bg-white border border-amber-200/80 rounded-xl p-2.5 cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.inPromoBanner}
                      onChange={(e) => setFormData({ ...formData, inPromoBanner: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        🏷️ Feature in &quot;Promo Ad Banners&quot; (Cards below Device Finder)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Shows this product as a compact, vibrant promo card.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 bg-white border border-amber-200/80 rounded-xl p-2.5 cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        🔥 Feature in &quot;Featured Mobile Accessories&quot; Section
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Displays this product in the popular featured accessories section on homepage.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 bg-white border border-amber-200/80 rounded-xl p-2.5 cursor-pointer hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isDealOfDay}
                      onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                      className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        ⚡ Feature in &quot;Flash Deals / Deals of the Day&quot;
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Displays this product in the countdown flash deals section.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct || isCompressingImage}
                  className="bg-[#2874f0] hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl shadow flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {isSavingProduct && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isSavingProduct
                    ? "Saving to Database..."
                    : isCompressingImage
                    ? "Optimizing Photo..."
                    : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ADD / EDIT CATEGORY MODAL (WITH IMAGE UPLOAD & URL SUPPORT)
         ------------------------------------------------------------- */}
      {addCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2874f0]" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Back Covers & Cases, Smartwatches, Fast Chargers"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug (e.g. cases-covers)</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="cases-covers"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Icon Emoji</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="📱"
                      className="w-14 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs text-center text-slate-900 outline-none text-base"
                    />
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                      {["📱", "🛡️", "🎧", "🔊", "⚡", "⌚", "🧲", "🚗", "🎮", "📸", "🔌", "🔋"].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, icon: em })}
                          className="hover:scale-125 transition-transform text-sm p-0.5 rounded cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Logo / Image Section (Presets, Upload File, or URL) */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-extrabold text-slate-800 flex items-center justify-between text-xs">
                  <span>Category Logo & Icon Selection</span>
                  <span className="text-[10px] text-blue-600 font-bold">Appears in Homepage Ribbon & Shop Filters</span>
                </label>

                {/* Option 1: Preset Logos Gallery */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    1. Choose from Official Category Logos:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 bg-white rounded-xl border border-slate-200">
                    {PRESET_CATEGORY_LOGOS.map((preset) => {
                      const isSelected = categoryForm.image === preset.image;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setCategoryForm((prev) => ({
                              ...prev,
                              image: preset.image,
                              icon: preset.icon,
                            }));
                            setCategoryImageUrlInput(preset.image);
                          }}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 border-blue-600 ring-2 ring-blue-500/30"
                              : "bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-slate-100"
                          }`}
                        >
                          <div className="w-8 h-8 flex items-center justify-center">
                            <img
                              src={preset.image}
                              alt={preset.label}
                              className="w-7 h-7 object-contain drop-shadow-2xs"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-800 line-clamp-1 leading-tight">
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Option 2: Upload Custom Image or Paste URL */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    2. Or Upload Custom File / Paste Image URL:
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-3.5 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={categoryImageUrlInput}
                        onChange={(e) => {
                          setCategoryImageUrlInput(e.target.value);
                          setCategoryForm((prev) => ({ ...prev, image: e.target.value.trim() }));
                        }}
                        placeholder="Or paste image URL (https://...)"
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 font-mono"
                      />
                      {categoryForm.image && (
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryForm((prev) => ({ ...prev, image: "" }));
                            setCategoryImageUrlInput("");
                          }}
                          className="bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 px-2.5 py-1 rounded-xl text-xs font-bold transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {categoryForm.image ? (
                      <img
                        src={categoryForm.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{categoryForm.icon || "📱"}</span>
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Live Ribbon Preview
                    </span>
                    <span className="font-extrabold text-slate-900 block text-xs">
                      {categoryForm.name || "Category Name"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Image Source: {categoryForm.image ? (categoryForm.image.startsWith("data:") ? "Custom Uploaded File" : categoryForm.image) : "Default Emoji"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline (Short Subtitle)</label>
                <input
                  type="text"
                  value={categoryForm.tagline}
                  onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                  placeholder="e.g. Premium Armor & Slim Silicone Covers"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Describe the accessories collection..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="categoryFeatured"
                  checked={categoryForm.featured}
                  onChange={(e) => setCategoryForm({ ...categoryForm, featured: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="categoryFeatured" className="font-bold text-slate-700 cursor-pointer">
                  Feature in top category ribbon on Homepage
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAddCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  {editingCategory ? "Save Category Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ADD BRAND MODAL
         ------------------------------------------------------------- */}
      {addBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#2874f0]" />
                <h3 className="font-extrabold text-slate-900 text-base">Add New Brand</h3>
              </div>
              <button
                onClick={() => setAddBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBrandSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Realme, Nothing, Spigen"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Focus</label>
                  <select
                    value={brandForm.categoryType}
                    onChange={(e) => setBrandForm({ ...brandForm, categoryType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  >
                    <option value="all">All Products</option>
                    <option value="phone">Smartphones</option>
                    <option value="audio">Audio & Headphones</option>
                    <option value="accessory">Accessories & Cases</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={brandForm.color}
                      onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={brandForm.color}
                      onChange={(e) => setBrandForm({ ...brandForm, color: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Logo Icon / Emoji / Image URL</label>
                <input
                  type="text"
                  value={brandForm.logo}
                  onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                  placeholder="Emoji (e.g. 📱, ⚡) or Image URL"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="brandFeatured"
                  checked={brandForm.featured}
                  onChange={(e) => setBrandForm({ ...brandForm, featured: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="brandFeatured" className="font-bold text-slate-700 cursor-pointer">
                  Feature this brand on homepage & rail
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddBrandModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          ADD PHONE MODEL / SERIES MODAL
         ------------------------------------------------------------- */}
      {addModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#2874f0]" />
                <h3 className="font-extrabold text-slate-900 text-base">Add Mobile Model & Series</h3>
              </div>
              <button
                onClick={() => setAddModelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Smartphone Brand *</label>
                <select
                  required
                  value={modelForm.brandId}
                  onChange={(e) => setModelForm({ ...modelForm, brandId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                >
                  {brandsList
                    .filter((b) => b.categoryType === "phone" || b.categoryType === "all" || b.featured)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.logo} {b.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Series Name *</label>
                <input
                  type="text"
                  required
                  value={modelForm.series}
                  onChange={(e) => setModelForm({ ...modelForm, series: e.target.value })}
                  placeholder="e.g. Nord Series, iPhone 16 Series, Galaxy S24 Series, GT Series"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Exact Mobile Model Name *</label>
                <input
                  type="text"
                  required
                  value={modelForm.name}
                  onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  placeholder="e.g. iPhone 16 Pro Max, Galaxy S24 Ultra, Realme GT 6T 5G"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Size (Optional)</label>
                  <input
                    type="text"
                    value={modelForm.displaySize}
                    onChange={(e) => setModelForm({ ...modelForm, displaySize: e.target.value })}
                    placeholder="e.g. 6.7&quot;"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={modelForm.releaseYear}
                    onChange={(e) => setModelForm({ ...modelForm, releaseYear: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddModelModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  Save Model & Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Product Details Inspection Modal */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <h3 className="font-bold text-sm text-slate-900">Ordered Product Full Details</h3>
              </div>
              <button
                onClick={() => setInspectProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="w-36 h-36 rounded-2xl border border-slate-200 bg-slate-50 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                  <img
                    src={inspectProduct.imageUrls?.[0] || "/images/placeholder.png"}
                    alt={inspectProduct.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1.5 flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {inspectProduct.brandId}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {inspectProduct.categoryId}
                    </span>
                    {inspectProduct.badgeText && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {inspectProduct.badgeText}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {inspectProduct.title}
                  </h4>

                  <div className="flex items-baseline gap-2 justify-center sm:justify-start pt-1">
                    <span className="text-2xl font-black text-slate-900">
                      {formatPrice(inspectProduct.basePrice)}
                    </span>
                    {inspectProduct.mrp > inspectProduct.basePrice && (
                      <span className="text-xs text-slate-400 line-through font-semibold">
                        {formatPrice(inspectProduct.mrp)}
                      </span>
                    )}
                    {inspectProduct.discountPercent > 0 && (
                      <span className="text-xs font-bold text-red-600">
                        ({inspectProduct.discountPercent}% OFF)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {inspectProduct.description || "High quality verified mobile accessory from PixKart catalog."}
                  </p>
                </div>
              </div>

              {/* Specs and Features */}
              {inspectProduct.features && inspectProduct.features.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="font-bold text-slate-800 block">Key Features & Highlights:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                    {inspectProduct.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Promotional Placement Status */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex flex-wrap gap-2 text-[11px] items-center">
                <span className="font-bold text-slate-700">Home Placement:</span>
                {inspectProduct.inHeroBanner && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                    📢 Top Hero Banner
                  </span>
                )}
                {inspectProduct.inSpotlight && (
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                    ✨ Brands in Spotlight
                  </span>
                )}
                {inspectProduct.inPromoBanner && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-semibold">
                    🏷️ Promo Ad Banners
                  </span>
                )}
                {inspectProduct.isFeatured && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                    🔥 Featured Accessories
                  </span>
                )}
                {inspectProduct.isDealOfDay && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-semibold">
                    ⚡ Flash Deals
                  </span>
                )}
                {!inspectProduct.inHeroBanner &&
                  !inspectProduct.inSpotlight &&
                  !inspectProduct.inPromoBanner &&
                  !inspectProduct.isFeatured &&
                  !inspectProduct.isDealOfDay && (
                    <span className="text-slate-500 italic">Standard Catalog Product</span>
                  )}
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <a
                  href={`/shop/${inspectProduct.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                >
                  <span>View in Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const prodToEdit = inspectProduct;
                    setInspectProduct(null);
                    setActiveTab("products");
                    startEditProduct(prodToEdit);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow cursor-pointer"
                >
                  Edit in Catalog
                </button>
                <button
                  type="button"
                  onClick={() => setInspectProduct(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
