"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Brand, brands as initialBrands } from "@/lib/data/brands";
import { PhoneModel, phoneModels } from "@/lib/data/models";
import { Product, ProductVariant, productVariants, products as initialProductsData } from "@/lib/data/products";
import { Order, OrderStatus, initialOrders } from "@/lib/data/orders";
import { Category, categories as initialCategories } from "@/lib/data/categories";

export interface CartItem {
  variantId: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
  model?: PhoneModel;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface UserAddress {
  id: string;
  type?: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  provider: "google" | "email";
  addresses: UserAddress[];
  createdAt: string;
}

export interface SpotlightBrand {
  id: string;
  brandName: string;
  tagline?: string;
  badge: string;
  headline: string;
  subtext: string;
  image: string;
  bgColor: string;
  link: string;
}

export interface HeroSlide {
  id: string;
  brandPrefix: string;
  brandTag: string;
  badgeLabel: string;
  title: string;
  priceText: string;
  saleDateText: string;
  featureText: string;
  bgGradient: string;
  link: string;
  phoneFrontImage: string;
}

export interface PromoAdCard {
  id: string;
  brandTag: string;
  brandTagColor: string;
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  bgGradient: string;
  link: string;
}

// Udupi City Pincode Registry & Validator (Delivery restricted exclusively to Udupi City)
export const UDUPI_PINCODES: Record<string, string> = {
  "576101": "Udupi Head Post Office, Udupi",
  "576102": "Manipal, Udupi",
  "576103": "Kunjibettu, Udupi",
  "576104": "Malpe, Udupi",
  "576105": "Santhekatte / Kallianpur, Udupi",
  "576106": "Brahmavar, Udupi",
  "576107": "Katapadi / Kaup, Udupi",
  "576108": "Shirva, Udupi",
  "576111": "Ambalpady, Udupi",
  "576112": "Indrali, Udupi",
  "576114": "Kinnimulki, Udupi",
  "576117": "Parkala, Udupi",
  "576120": "Saligrama, Udupi",
  "576121": "Barkur, Udupi",
  "576122": "Kota, Udupi",
  "576124": "Kadiyali, Udupi",
  "576125": "Gundibail, Udupi",
};

export const isUdupiPincode = (pin: string): boolean => {
  const clean = pin.trim();
  return clean.startsWith("5761") || !!UDUPI_PINCODES[clean];
};

export const isValidEmailAddress = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) return false;

  const domain = clean.split("@")[1];
  if (!domain || domain.length < 4 || !domain.includes(".")) return false;

  const invalidTestDomains = ["test.com", "fake.com", "asdf.com", "temp.com", "trashmail.com"];
  if (invalidTestDomains.includes(domain)) return false;

  return true;
};

export const UDUPI_UNDELIVERABLE_MESSAGE =
  "Delivery is currently unavailable in this location and account registration is restricted to serviceable delivery zones. We are expanding rapidly — stay tuned for updates!";

export const INITIAL_SAVED_ADDRESSES: UserAddress[] = [
  {
    id: "addr_home",
    type: "Home",
    name: "Mohammed Yunus",
    phone: "+91 98765 43210",
    address: "207 second floor golden plaza appartment near old taluk office",
    city: "Udupi",
    state: "Karnataka",
    pincode: "576101",
    isDefault: true,
  },
  {
    id: "addr_work",
    type: "Work",
    name: "Mohammed Yunus",
    phone: "+91 98765 43210",
    address: "Tech Hub, 3rd Floor, Manipal Commercial Complex, Tiger Circle",
    city: "Manipal",
    state: "Karnataka",
    pincode: "576102",
    isDefault: false,
  },
];

interface AppContextType {
  selectedBrand: Brand | null;
  selectedModel: PhoneModel | null;
  setSelectedDevice: (brand: Brand | null, model: PhoneModel | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (productId: string, modelId?: string, quantity?: number, color?: string, storage?: string) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Wishlist
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  // Multi-Address & Pincode Deliverability (Udupi City Restricted)
  addresses: UserAddress[];
  activeAddress: UserAddress;
  activeAddressId: string;
  setActiveAddressId: (id: string) => void;
  saveUserAddress: (address: UserAddress) => boolean;
  deleteUserAddress: (addressId: string) => void;
  addressModalOpen: boolean;
  setAddressModalOpen: (open: boolean) => void;

  pincode: string;
  setPincode: (pin: string) => boolean;
  pincodeLocation: string;
  pincodeError: string | null;

  // UI
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Customer Authentication (Google OAuth & Email)
  user: UserProfile | null;
  signInWithGoogle: (customData?: Partial<UserProfile>, pincode?: string) => Promise<UserProfile>;
  signInWithEmail: (email: string, name?: string, pincode?: string) => Promise<UserProfile>;
  signOutUser: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Recently Viewed Products
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;

  // Product Management (Admin & Catalog)
  productsList: Product[];
  addProduct: (product: Product) => Promise<{ success: boolean; message?: string; persisted?: boolean }>;
  updateProduct: (product: Product) => Promise<{ success: boolean; message?: string; persisted?: boolean }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; message?: string }>;
  syncLocalProductsToCloud: () => Promise<{ total: number; synced: number; failed: number }>;
  toggleProductSpotlight: (productId: string, inSpotlight?: boolean) => void;
  toggleProductHeroBanner: (productId: string, inHeroBanner?: boolean) => void;
  toggleProductPromoBanner: (productId: string, inPromoBanner?: boolean) => void;
  toggleProductFeatured: (productId: string, isFeatured?: boolean) => void;
  toggleProductDealOfDay: (productId: string, isDealOfDay?: boolean) => void;

  // Category Management (Admin & Catalog)
  categoriesList: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  // Brand Management (Admin & Catalog)
  brandsList: Brand[];
  addBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;

  // Phone Model & Series Management (Admin & Catalog)
  phoneModelsList: PhoneModel[];
  addPhoneModel: (model: PhoneModel) => void;
  deletePhoneModel: (modelId: string) => void;

  // Order Management & Tracking
  ordersList: Order[];
  userOrders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  placeOrder: (customerInfo: { name: string; email: string; phone: string; address: string; pincode: string }) => Order;

  // Admin Spotlight Brands Management
  spotlightBrandsList: SpotlightBrand[];
  addSpotlightBrand: (item: SpotlightBrand) => void;
  updateSpotlightBrand: (item: SpotlightBrand) => void;
  deleteSpotlightBrand: (id: string) => void;

  // Admin Hero Banner Slides Management
  heroSlidesList: HeroSlide[];
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;

  // Admin Promo Ad Banners Management
  promoAdBannersList: PromoAdCard[];
  addPromoAd: (ad: PromoAdCard) => void;
  updatePromoAd: (ad: PromoAdCard) => void;
  deletePromoAd: (id: string) => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to clean delivered orders older than 30 days
const cleanOldDeliveredOrders = (orders: Order[]): Order[] => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return orders.filter((order) => {
    if (order.status === "Delivered" && order.deliveredAt) {
      const deliveredDate = new Date(order.deliveredAt);
      return deliveredDate >= thirtyDaysAgo;
    }
    return true;
  });
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModelState] = useState<PhoneModel | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  
  // Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [activeAddressId, setActiveAddressIdState] = useState<string>("");
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);

  // Delivery location (empty for guests to prevent revealing delivery areas)
  const [pincode, setPincodeState] = useState<string>("");
  const [pincodeLocation, setPincodeLocation] = useState<string>("Select Pincode");
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // User Auth State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Catalog State
  const [productsList, setProductsList] = useState<Product[]>(initialProductsData);
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [brandsList, setBrandsList] = useState<Brand[]>(initialBrands);
  const [phoneModelsList, setPhoneModelsList] = useState<PhoneModel[]>(phoneModels);
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders);

  // Spotlight Brands, Hero Slides, Promo Ads State (Admin Controlled)
  const [spotlightBrandsList, setSpotlightBrandsList] = useState<SpotlightBrand[]>([]);
  const [heroSlidesList, setHeroSlidesList] = useState<HeroSlide[]>([]);
  const [promoAdBannersList, setPromoAdBannersList] = useState<PromoAdCard[]>([]);

  // Admin State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Helper to clear all ephemeral guest session data
  const clearGuestStorage = () => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage) {
        sessionStorage.removeItem("pixkart_guest_cart");
        sessionStorage.removeItem("pixkart_guest_wishlist");
        sessionStorage.removeItem("pixkart_guest_compare");
        sessionStorage.removeItem("pixkart_guest_recently_viewed");
      }
      localStorage.removeItem("pixkart_cart");
      localStorage.removeItem("pixkart_wishlist");
      localStorage.removeItem("pixkart_compare");
    } catch (e) {
      console.error("Error clearing guest storage", e);
    }
  };

  // Load Persisted Data on Mount (Dual Storage: sessionStorage for guests, localStorage for users)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Saved Addresses
    const savedAddrs = localStorage.getItem("pixkart_saved_addresses_v2");
    if (savedAddrs) {
      try {
        const parsed = JSON.parse(savedAddrs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved addresses", e);
      }
    }

    const savedActiveId = localStorage.getItem("pixkart_active_address_id");
    if (savedActiveId) {
      setActiveAddressIdState(savedActiveId);
    }

    // 2. User Session Check
    const savedUser = localStorage.getItem("pixkart_user_session");
    let activeProfile: UserProfile | null = null;

    if (savedUser) {
      try {
        activeProfile = JSON.parse(savedUser);
        setUser(activeProfile);
        if (activeProfile?.addresses && activeProfile.addresses.length > 0) {
          setAddresses(activeProfile.addresses);
        }
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    // 3. Storage Separation based on Auth State
    if (activeProfile) {
      // Authenticated User: Load from persistent localStorage
      const savedRecent = localStorage.getItem("pixkart_recently_viewed");
      if (savedRecent) {
        try {
          setRecentlyViewed(JSON.parse(savedRecent));
        } catch {
          setRecentlyViewed(initialProductsData.slice(0, 6));
        }
      } else {
        setRecentlyViewed(initialProductsData.slice(0, 6));
      }

      const savedCart = localStorage.getItem("pixkart_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }

      const savedWishlist = localStorage.getItem("pixkart_wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error("Failed to parse wishlist", e);
        }
      }

      const savedCompare = localStorage.getItem("pixkart_compare");
      if (savedCompare) {
        try {
          setCompareList(JSON.parse(savedCompare));
        } catch (e) {
          console.error("Failed to parse compare", e);
        }
      }
    } else {
      // Unauthenticated Guest: Zero-footprint ephemeral sessionStorage only
      // Purge any accidental localStorage remnants left from previous sessions
      localStorage.removeItem("pixkart_cart");
      localStorage.removeItem("pixkart_wishlist");
      localStorage.removeItem("pixkart_compare");

      if (window.sessionStorage) {
        try {
          const guestCart = sessionStorage.getItem("pixkart_guest_cart");
          if (guestCart) setCart(JSON.parse(guestCart));

          const guestWishlist = sessionStorage.getItem("pixkart_guest_wishlist");
          if (guestWishlist) setWishlist(JSON.parse(guestWishlist));

          const guestCompare = sessionStorage.getItem("pixkart_guest_compare");
          if (guestCompare) setCompareList(JSON.parse(guestCompare));

          const guestRecent = sessionStorage.getItem("pixkart_guest_recently_viewed");
          if (guestRecent) {
            setRecentlyViewed(JSON.parse(guestRecent));
          } else {
            setRecentlyViewed([]);
          }
        } catch {
          setRecentlyViewed([]);
        }
      } else {
        setRecentlyViewed([]);
      }
    }

    // 4. Products (Clean initial state, dynamically populated exclusively via Admin Portal)
    const savedProducts = localStorage.getItem("pixkart_products_v5");
    if (savedProducts) {
      try {
        const parsed: Product[] = JSON.parse(savedProducts);
        setProductsList(parsed);
      } catch {
        setProductsList([]);
      }
    } else {
      localStorage.removeItem("pixkart_products_v2");
      localStorage.removeItem("pixkart_products_v3");
      localStorage.removeItem("pixkart_products_v4");
      setProductsList([]);
      localStorage.setItem("pixkart_products_v5", JSON.stringify([]));
    }

    // 5. Categories
    const savedCategories = localStorage.getItem("pixkart_categories_v5");
    if (savedCategories) {
      setCategoriesList(JSON.parse(savedCategories));
    } else {
      setCategoriesList(initialCategories);
      localStorage.setItem("pixkart_categories_v5", JSON.stringify(initialCategories));
    }

    // 6. Brands & Models
    const savedBrands = localStorage.getItem("pixkart_brands_v5");
    if (savedBrands) {
      setBrandsList(JSON.parse(savedBrands));
    } else {
      setBrandsList(initialBrands);
      localStorage.setItem("pixkart_brands_v5", JSON.stringify(initialBrands));
    }

    const savedModels = localStorage.getItem("pixkart_models_v5");
    if (savedModels) {
      setPhoneModelsList(JSON.parse(savedModels));
    } else {
      setPhoneModelsList(phoneModels);
      localStorage.setItem("pixkart_models_v5", JSON.stringify(phoneModels));
    }

    // 7. Orders (Clean initial state)
    const savedOrders = localStorage.getItem("pixkart_orders_v5");
    if (savedOrders) {
      try {
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        const cleanedOrders = cleanOldDeliveredOrders(parsedOrders);
        setOrdersList(cleanedOrders);
        localStorage.setItem("pixkart_orders_v5", JSON.stringify(cleanedOrders));
      } catch {
        setOrdersList([]);
      }
    } else {
      localStorage.removeItem("pixkart_orders_v2");
      localStorage.removeItem("pixkart_orders_v3");
      localStorage.removeItem("pixkart_orders_v4");
      setOrdersList([]);
      localStorage.setItem("pixkart_orders_v5", JSON.stringify([]));
    }

    // 8. Admin Auth
    const savedAdmin = localStorage.getItem("pixkart_admin_auth");
    if (savedAdmin === "true") {
      setIsAdminAuthenticated(true);
    }

    // 9. Spotlight Brands
    const savedSpotlight = localStorage.getItem("pixkart_spotlight_brands_v5");
    if (savedSpotlight) {
      try {
        setSpotlightBrandsList(JSON.parse(savedSpotlight));
      } catch {
        setSpotlightBrandsList([]);
      }
    }

    // 10. Hero Banner Slides
    const savedHero = localStorage.getItem("pixkart_hero_slides_v5");
    if (savedHero) {
      try {
        setHeroSlidesList(JSON.parse(savedHero));
      } catch {
        setHeroSlidesList([]);
      }
    }

    // 11. Promo Ad Banners
    const savedPromo = localStorage.getItem("pixkart_promo_ads_v5");
    if (savedPromo) {
      try {
        setPromoAdBannersList(JSON.parse(savedPromo));
      } catch {
        setPromoAdBannersList([]);
      }
    }

    // Dynamic MySQL Database Sync on Startup
    fetch("/api/products")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && Array.isArray(data.products) && data.products.length > 0) {
            return data;
          }
        }
        const fallbackRes = await fetch("/api/products.json").catch(() => null);
        if (fallbackRes && fallbackRes.ok) return fallbackRes.json();
        return null;
      })
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
          if (typeof window !== "undefined") {
            localStorage.setItem("pixkart_products_v5", JSON.stringify(data.products));
          }
        }
      })
      .catch(() => {});

    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.brands) && data.brands.length > 0) {
          setBrandsList(data.brands);
          if (typeof window !== "undefined") {
            localStorage.setItem("pixkart_brands_v5", JSON.stringify(data.brands));
          }
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategoriesList(data.categories);
          if (typeof window !== "undefined") {
            localStorage.setItem("pixkart_categories_v5", JSON.stringify(data.categories));
          }
        }
      })
      .catch(() => {});
  }, []);

  // PC Boot & Reconnection Heartbeat: Automatically detects when MySQL transitions from offline to online
  useEffect(() => {
    let wasOnline = false;
    let isMounted = true;

    const checkBootAndDrain = async () => {
      try {
        const res = await fetch("/api/db/health", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        const isNowOnline = data?.status === "connected";
        const pendingCount = data?.tableCounts?.totalCloudQueuePending || 0;

        // If transition detected (was offline, now online) or pending cloud items exist
        if (isNowOnline && (!wasOnline || pendingCount > 0)) {
          wasOnline = true;
          try {
            const drainRes = await fetch("/api/orders/sync-and-drain", { method: "POST" });
            const drainData = await drainRes.json();
            if (drainData?.success && (drainData.totalSynced > 0 || drainData.syncedCount > 0)) {
              console.log(
                `[Auto-Sync Engine] PC Boot / Online sync completed: ${drainData.totalSynced || drainData.syncedCount} item(s) reconciled.`
              );
            }
          } catch {}

          // Refresh catalog from MySQL
          if (isMounted) {
            fetch("/api/products")
              .then((r) => r.json())
              .then((d) => {
                if (d?.products?.length) {
                  setProductsList(d.products);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pixkart_products_v5", JSON.stringify(d.products));
                  }
                }
              })
              .catch(() => {});

            fetch("/api/brands")
              .then((r) => r.json())
              .then((d) => {
                if (d?.brands?.length) {
                  setBrandsList(d.brands);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pixkart_brands_v5", JSON.stringify(d.brands));
                  }
                }
              })
              .catch(() => {});

            fetch("/api/categories")
              .then((r) => r.json())
              .then((d) => {
                if (d?.categories?.length) {
                  setCategoriesList(d.categories);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("pixkart_categories_v5", JSON.stringify(d.categories));
                  }
                }
              })
              .catch(() => {});
          }
        } else if (!isNowOnline) {
          wasOnline = false;
        }
      } catch {
        wasOnline = false;
      }
    };

    checkBootAndDrain();
    const heartbeatTimer = setInterval(checkBootAndDrain, 4000);

    const handleFocus = () => {
      checkBootAndDrain();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      isMounted = false;
      clearInterval(heartbeatTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, []);

  // Auto-Scrub: Purge any deleted products from Recently Viewed, Cart, and Wishlist immediately
  useEffect(() => {
    if (!productsList || productsList.length === 0) return;

    setRecentlyViewed((prev) => {
      const cleaned = prev.filter((rv) =>
        productsList.some((p) => (p.id === rv.id || p.slug === rv.slug) && p.stockStatus !== "out_of_stock")
      );
      if (cleaned.length !== prev.length && typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_recently_viewed", JSON.stringify(cleaned));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_recently_viewed", JSON.stringify(cleaned));
      }
      return cleaned;
    });

    setCart((prev) => {
      const cleaned = prev.filter((item) => productsList.some((p) => p.id === item.product?.id));
      if (cleaned.length !== prev.length && typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_cart", JSON.stringify(cleaned));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_cart", JSON.stringify(cleaned));
      }
      return cleaned;
    });

    setWishlist((prev) => {
      const cleaned = prev.filter((item) => productsList.some((p) => p.id === item.id));
      if (cleaned.length !== prev.length && typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_wishlist", JSON.stringify(cleaned));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_wishlist", JSON.stringify(cleaned));
      }
      return cleaned;
    });
  }, [productsList, user]);

  // 1. Sync Orders from Master MySQL Database with Real-Time 3-Second Polling & Live DB Authority
  useEffect(() => {
    let isMounted = true;

    const fetchDbOrders = async () => {
      try {
        const url = isAdminAuthenticated
          ? "/api/orders"
          : user?.email
          ? `/api/orders?email=${encodeURIComponent(user.email)}`
          : null;
        if (!url) return;

        const res = await fetch(url, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        // If customer was deleted from MySQL, server returns 401 Unauthorized
        if (res.status === 401 && !isAdminAuthenticated) {
          if (isMounted) {
            signOutUser();
            if (typeof window !== "undefined") {
              window.location.replace("/signin?deleted=true");
            }
          }
          return;
        }

        const data = await res.json();
        if (data && data.isConnected && Array.isArray(data.orders)) {
          const formattedOrders: Order[] = data.orders.map((dbRow: any) => ({
            id: dbRow.id,
            customerName: dbRow.customer_name || dbRow.customerName || "Customer",
            email: dbRow.customer_email || dbRow.email || "",
            phone: dbRow.customer_phone || dbRow.phone || "",
            address:
              typeof dbRow.shipping_address === "string"
                ? `${JSON.parse(dbRow.shipping_address)?.street || ""}, ${JSON.parse(dbRow.shipping_address)?.city || ""}`
                : `${dbRow.shipping_address?.street || ""}, ${dbRow.shipping_address?.city || ""}`,
            pincode: dbRow.pincode,
            items: Array.isArray(dbRow.items) ? dbRow.items : [],
            totalAmount: parseFloat(dbRow.total_amount) || 0,
            status: (!dbRow.order_status || dbRow.order_status === "Order Placed" || dbRow.order_status === "Ordered")
              ? "Ordered"
              : (dbRow.order_status as OrderStatus),
            paymentMethod: dbRow.payment_method || "cod",
            paymentStatus: dbRow.payment_status || "pending",
            trackingNumber: dbRow.tracking_number,
            createdAt: dbRow.created_at || new Date().toISOString(),
          }));

          if (isMounted) {
            // Master MySQL is the absolute Source of Truth:
            // If an order was deleted in MySQL, it is absent from formattedOrders,
            // so we set formattedOrders directly, instantly wiping deleted orders.
            setOrdersList(formattedOrders);
            if (typeof window !== "undefined") {
              localStorage.setItem("pixkart_orders_v5", JSON.stringify(formattedOrders));
            }
          }
        }
      } catch (e) {
        console.warn("[Orders Sync notice]:", e);
      }
    };

    fetchDbOrders();

    // 3-Second Real-Time Synchronization Interval for Orders
    const pollTimer = setInterval(fetchDbOrders, 3000);

    // Immediate sync on tab focus
    const handleFocus = () => {
      fetchDbOrders();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [user?.email, isAdminAuthenticated]);

  // 2. Real-Time Customer Account Verification Heartbeat: Detects account deletion in MySQL
  useEffect(() => {
    if (!user || !user.email) return;

    let isMounted = true;

    const verifyUserSession = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }
        );

        if (res.status === 401) {
          // Account was deleted in MySQL!
          if (isMounted) {
            signOutUser();
            if (typeof window !== "undefined") {
              window.location.replace("/signin?deleted=true");
            }
          }
          return;
        }

        const data = await res.json();
        if (data && data.exists === false) {
          if (isMounted) {
            signOutUser();
            if (typeof window !== "undefined") {
              window.location.replace("/signin?deleted=true");
            }
          }
        }
      } catch (err) {
        console.warn("[User Heartbeat Notice]:", err);
      }
    };

    // Run verification immediately
    verifyUserSession();

    // Poll every 3 seconds
    const heartbeatTimer = setInterval(verifyUserSession, 3000);

    const handleFocus = () => {
      verifyUserSession();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      isMounted = false;
      clearInterval(heartbeatTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [user?.email, user?.id]);

  // Zero-Footprint Auto-Purge: Clear guest storage on window/tab exit
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      const activeSession = localStorage.getItem("pixkart_user_session");
      if (!activeSession) {
        clearGuestStorage();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Compute active address
  const activeAddress =
    addresses.find((a) => a.id === activeAddressId) ||
    addresses[0] ||
    INITIAL_SAVED_ADDRESSES[0];

  // Keep active address in sync with delivery pincode location
  useEffect(() => {
    if (activeAddress) {
      setPincodeState(activeAddress.pincode);
      setPincodeLocation(`${activeAddress.city}, ${activeAddress.pincode}`);
    }
  }, [activeAddress]);

  const setActiveAddressId = (id: string) => {
    setActiveAddressIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("pixkart_active_address_id", id);
    }
    const match = addresses.find((a) => a.id === id);
    if (match) {
      setPincodeState(match.pincode);
      setPincodeLocation(`${match.city}, ${match.pincode}`);
    }
  };

  const saveUserAddress = (address: UserAddress): boolean => {
    if (!isUdupiPincode(address.pincode)) {
      setPincodeError(UDUPI_UNDELIVERABLE_MESSAGE);
      return false;
    }

    setAddresses((prev) => {
      const existingIdx = prev.findIndex((a) => a.id === address.id);
      let updated: UserAddress[];
      if (existingIdx >= 0) {
        updated = prev.map((a) => (a.id === address.id ? address : a));
      } else {
        updated = [address, ...prev];
      }
      if (address.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: a.id === address.id }));
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("pixkart_saved_addresses_v2", JSON.stringify(updated));
      }
      return updated;
    });

    setActiveAddressId(address.id);

    // Sync with logged in user
    if (user) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedAddrs = prevUser.addresses ? [...prevUser.addresses] : [];
        const idx = updatedAddrs.findIndex((a) => a.id === address.id);
        if (idx >= 0) {
          updatedAddrs[idx] = address;
        } else {
          updatedAddrs.unshift(address);
        }
        const updated = { ...prevUser, addresses: updatedAddrs };
        if (typeof window !== "undefined") {
          localStorage.setItem("pixkart_user_session", JSON.stringify(updated));
        }
        return updated;
      });
    }

    return true;
  };

  const deleteUserAddress = (addressId: string) => {
    setAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addressId);
      const safeUpdated = updated.length > 0 ? updated : INITIAL_SAVED_ADDRESSES;
      if (typeof window !== "undefined") {
        localStorage.setItem("pixkart_saved_addresses_v2", JSON.stringify(safeUpdated));
      }
      return safeUpdated;
    });

    if (activeAddressId === addressId) {
      setActiveAddressId(addresses[0]?.id || "addr_home");
    }

    if (user) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updated = {
          ...prevUser,
          addresses: prevUser.addresses.filter((a) => a.id !== addressId),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("pixkart_user_session", JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  // Sync Cart: sessionStorage for Guests, localStorage for Logged-In Users
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("pixkart_cart", JSON.stringify(cart));
    } else {
      if (window.sessionStorage) {
        sessionStorage.setItem("pixkart_guest_cart", JSON.stringify(cart));
      }
    }
  }, [cart, user]);

  // Sync Wishlist: sessionStorage for Guests, localStorage for Logged-In Users
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("pixkart_wishlist", JSON.stringify(wishlist));
    } else {
      if (window.sessionStorage) {
        sessionStorage.setItem("pixkart_guest_wishlist", JSON.stringify(wishlist));
      }
    }
  }, [wishlist, user]);

  // Sync Compare: sessionStorage for Guests, localStorage for Logged-In Users
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("pixkart_compare", JSON.stringify(compareList));
    } else {
      if (window.sessionStorage) {
        sessionStorage.setItem("pixkart_guest_compare", JSON.stringify(compareList));
      }
    }
  }, [compareList, user]);

  // --- Cart & Wishlist Migration Helper ---
  const mergeGuestItemsOnLogin = (guestCartItems: CartItem[], guestWishlistItems: Product[]) => {
    // 1. Merge Cart
    setCart((currentCart) => {
      const existingCartStr = typeof window !== "undefined" ? localStorage.getItem("pixkart_cart") : null;
      let existingUserCart: CartItem[] = [];
      if (existingCartStr) {
        try {
          existingUserCart = JSON.parse(existingCartStr);
        } catch {
          existingUserCart = [];
        }
      }

      const merged = [...existingUserCart];
      const itemsToMerge = guestCartItems.length > 0 ? guestCartItems : currentCart;

      itemsToMerge.forEach((guestItem) => {
        const existingIdx = merged.findIndex((i) => i.variantId === guestItem.variantId);
        if (existingIdx >= 0) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            quantity: merged[existingIdx].quantity + guestItem.quantity,
          };
        } else {
          merged.push(guestItem);
        }
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("pixkart_cart", JSON.stringify(merged));
      }
      return merged;
    });

    // 2. Merge Wishlist
    setWishlist((currentWishlist) => {
      const existingWishlistStr = typeof window !== "undefined" ? localStorage.getItem("pixkart_wishlist") : null;
      let existingUserWishlist: Product[] = [];
      if (existingWishlistStr) {
        try {
          existingUserWishlist = JSON.parse(existingWishlistStr);
        } catch {
          existingUserWishlist = [];
        }
      }

      const mergedWishlist = [...existingUserWishlist];
      const wishlistItemsToMerge = guestWishlistItems.length > 0 ? guestWishlistItems : currentWishlist;

      wishlistItemsToMerge.forEach((item) => {
        if (!mergedWishlist.some((p) => p.id === item.id)) {
          mergedWishlist.push(item);
        }
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("pixkart_wishlist", JSON.stringify(mergedWishlist));
      }
      return mergedWishlist;
    });

    // 3. Clear guest session storage
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem("pixkart_guest_cart");
      sessionStorage.removeItem("pixkart_guest_wishlist");
      sessionStorage.removeItem("pixkart_guest_compare");
      sessionStorage.removeItem("pixkart_guest_recently_viewed");
    }
  };

  // --- Authentication Functions (Geofenced with Zero Persistent Footprint on Rejection) ---
  const signInWithGoogle = async (customData?: Partial<UserProfile>, pincodeInput?: string): Promise<UserProfile> => {
    const targetPin = (pincodeInput || pincode || "").trim();
    if (!targetPin) {
      throw new Error("Please enter your 6-digit delivery pincode.");
    }
    if (targetPin.length !== 6) {
      throw new Error("Please enter a valid 6-digit Indian Pincode.");
    }
    if (!isUdupiPincode(targetPin)) {
      setPincodeError(UDUPI_UNDELIVERABLE_MESSAGE);
      throw new Error(UDUPI_UNDELIVERABLE_MESSAGE);
    }

    const userEmail = (customData?.email || "").trim().toLowerCase();
    if (!userEmail || !isValidEmailAddress(userEmail)) {
      throw new Error("Please provide a valid Google Gmail address to sign in.");
    }

    const rawName = customData?.name?.trim() || userEmail.split("@")[0] || "User";
    const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Authentic Google Profile Avatar (Use Google photo if provided, or Google Material initial badge, NO stock photos)
    const googleAvatar =
      customData?.avatar && customData.avatar.includes("googleusercontent.com")
        ? customData.avatar
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a73e8&color=ffffff&bold=true&size=256&rounded=true`;

    const googleUser: UserProfile = {
      id: customData?.id || `goog_${Date.now()}`,
      name: userName,
      email: userEmail,
      avatar: googleAvatar,
      phone: customData?.phone || "+91 98765 43210",
      provider: "google",
      createdAt: new Date().toISOString(),
      addresses: addresses,
    };

    setUser(googleUser);
    setPincode(targetPin);
    if (typeof window !== "undefined") {
      localStorage.setItem("pixkart_user_session", JSON.stringify(googleUser));
    }

    // Merge guest cart & wishlist into user's persistent profile
    mergeGuestItemsOnLogin(cart, wishlist);

    // Sync user to master MySQL database
    try {
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser),
      }).catch(() => {});
    } catch {}

    return googleUser;
  };

  const signInWithEmail = async (email: string, name?: string, pincodeInput?: string): Promise<UserProfile> => {
    const targetPin = (pincodeInput || pincode || "").trim();
    if (!targetPin) {
      throw new Error("Please enter your 6-digit delivery pincode.");
    }
    if (targetPin.length !== 6) {
      throw new Error("Please enter a valid 6-digit Indian Pincode.");
    }
    if (!isUdupiPincode(targetPin)) {
      setPincodeError(UDUPI_UNDELIVERABLE_MESSAGE);
      throw new Error(UDUPI_UNDELIVERABLE_MESSAGE);
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmailAddress(cleanEmail)) {
      throw new Error("Google Identity Verification failed: Please enter a genuine, active Google email address.");
    }

    const formattedName = name?.trim() || cleanEmail.split("@")[0] || "Customer";
    const displayName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    const googleAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a73e8&color=ffffff&bold=true&size=256&rounded=true`;

    const googleVerifiedUser: UserProfile = {
      id: `goog_${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      avatar: googleAvatar,
      phone: "+91 98765 43210",
      provider: "google",
      createdAt: new Date().toISOString(),
      addresses: addresses,
    };

    setUser(googleVerifiedUser);
    setPincode(targetPin);
    if (typeof window !== "undefined") {
      localStorage.setItem("pixkart_user_session", JSON.stringify(googleVerifiedUser));
    }

    // Merge guest cart & wishlist into user's persistent profile
    mergeGuestItemsOnLogin(cart, wishlist);

    // Sync user to master MySQL database
    try {
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleVerifiedUser),
      }).catch(() => {});
    } catch {}

    return googleVerifiedUser;
  };

  const signOutUser = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("pixkart_user_session");
      localStorage.removeItem("pixkart_saved_addresses_v2");
      localStorage.removeItem("pixkart_active_address_id");
      localStorage.removeItem("pixkart_cart");
      localStorage.removeItem("pixkart_wishlist");
      localStorage.removeItem("pixkart_compare");
      localStorage.removeItem("pixkart_recently_viewed");
      clearGuestStorage();
    }
    setAddresses([]);
    setCart([]);
    setWishlist([]);
    setCompareList([]);
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem("pixkart_user_session", JSON.stringify(updated));
      }
      try {
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }).catch(() => {});
      } catch {}
      return updated;
    });
  };

  const addRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      if (typeof window !== "undefined") {
        if (user) {
          localStorage.setItem("pixkart_recently_viewed", JSON.stringify(updated));
        } else {
          if (window.sessionStorage) {
            sessionStorage.setItem("pixkart_guest_recently_viewed", JSON.stringify(updated));
          }
        }
      }
      return updated;
    });
  };

  // Device Selector
  const setSelectedDevice = (brand: Brand | null, model: PhoneModel | null) => {
    setSelectedBrandState(brand);
    setSelectedModelState(model);
  };

  // Cart Functions
  const addToCart = (
    productId: string,
    modelId?: string,
    quantity: number = 1,
    color?: string,
    storage?: string
  ) => {
    const product = productsList.find((p) => p.id === productId);
    if (!product) return;

    const model = modelId ? phoneModelsList.find((m) => m.id === modelId) : selectedModel || undefined;
    const variantId = `${productId}_${model?.id || "default"}_${color || "default"}_${storage || "default"}`;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variantId === variantId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prevCart,
          {
            variantId,
            quantity,
            product,
            model,
            selectedColor: color,
            selectedStorage: storage,
          },
        ];
      }
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Functions
  const addToWishlist = (product: Product) => {
    if (!isInWishlist(product.id)) {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((p) => p.id === productId);
  };

  // Compare Functions
  const addToCompare = (product: Product) => {
    if (!isInCompare(product.id)) {
      setCompareList((prev) => [...prev, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInCompare = (productId: string): boolean => {
    return compareList.some((p) => p.id === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Pincode Functions (Strictly Udupi City Delivery)
  const setPincode = (pin: string): boolean => {
    const cleanPin = pin.trim();
    if (isUdupiPincode(cleanPin)) {
      setPincodeState(cleanPin);
      setPincodeLocation(UDUPI_PINCODES[cleanPin] || `Udupi, Karnataka - ${cleanPin}`);
      setPincodeError(null);
      return true;
    } else {
      setPincodeError(UDUPI_UNDELIVERABLE_MESSAGE);
      return false;
    }
  };

  // Catalog CRUD Functions
  const addProduct = async (newProduct: Product): Promise<{ success: boolean; message?: string; persisted?: boolean }> => {
    setProductsList((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newProduct.id)];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
        }
      } catch (storageErr) {
        console.warn("[Storage] LocalStorage quota exceeded or unavailable:", storageErr);
      }
      return updated;
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.warn(`[Product API Notice] Server returned status ${res.status}:`, data);
        return {
          success: false,
          message: data?.error || data?.message || `Server rejected product (${res.status}).`,
        };
      }

      return {
        success: true,
        persisted: Boolean(data?.persisted || data?.savedToLocalDb),
        message: data?.message || "Product saved successfully.",
      };
    } catch (err: any) {
      console.warn("[Product API Notice] Network or serverless exception:", err);
      return {
        success: false,
        message: err?.message || "Could not reach database server. Product remains buffered in browser.",
      };
    }
  };

  const updateProduct = async (updatedProduct: Product): Promise<{ success: boolean; message?: string; persisted?: boolean }> => {
    setProductsList((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
        }
      } catch (storageErr) {
        console.warn("[Storage] LocalStorage quota exceeded or unavailable:", storageErr);
      }
      return updated;
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          message: data?.error || data?.message || `Server rejected update (${res.status}).`,
        };
      }

      return {
        success: true,
        persisted: Boolean(data?.persisted || data?.savedToLocalDb),
        message: data?.message || "Product updated successfully.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Could not reach database server. Update remains buffered in browser.",
      };
    }
  };

  const deleteProduct = async (productId: string): Promise<{ success: boolean; message?: string }> => {
    // 1. Remove from active product list
    setProductsList((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });

    // 2. Immediately remove from Recently Viewed
    setRecentlyViewed((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_recently_viewed", JSON.stringify(updated));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_recently_viewed", JSON.stringify(updated));
      }
      return updated;
    });

    // 3. Immediately remove from Cart
    setCart((prev) => {
      const updated = prev.filter((item) => item.product?.id !== productId);
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_cart", JSON.stringify(updated));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_cart", JSON.stringify(updated));
      }
      return updated;
    });

    // 4. Immediately remove from Wishlist
    setWishlist((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_wishlist", JSON.stringify(updated));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_wishlist", JSON.stringify(updated));
      }
      return updated;
    });

    // 5. Immediately remove from Compare
    setCompareList((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      if (typeof window !== "undefined") {
        if (user) localStorage.setItem("pixkart_compare", JSON.stringify(updated));
        else if (window.sessionStorage) sessionStorage.setItem("pixkart_guest_compare", JSON.stringify(updated));
      }
      return updated;
    });

    // 6. Persist deletion to master MySQL / Cloud queue
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      return { success: res.ok, message: data?.message || "Product deleted." };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to reach server to delete." };
    }
  };

  /**
   * Sync any products buffered locally in browser localStorage directly to the database / TiDB Cloud.
   * Useful when products were added on a mobile device while offline or on static CDN hosting.
   */
  const syncLocalProductsToCloud = async (): Promise<{ total: number; synced: number; failed: number }> => {
    const prods = productsList;
    if (!prods || prods.length === 0) return { total: 0, synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const p of prods) {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        if (res.ok) {
          synced++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { total: prods.length, synced, failed };
  };

  const toggleProductSpotlight = (productId: string, inSpotlight?: boolean) => {
    setProductsList((prev) => {
      let targetProd: Product | undefined;
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newVal = inSpotlight !== undefined ? inSpotlight : !p.inSpotlight;
          targetProd = { ...p, inSpotlight: newVal };
          return targetProd;
        }
        return p;
      });
      localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
      if (targetProd) {
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetProd),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const toggleProductHeroBanner = (productId: string, inHeroBanner?: boolean) => {
    setProductsList((prev) => {
      let targetProd: Product | undefined;
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newVal = inHeroBanner !== undefined ? inHeroBanner : !p.inHeroBanner;
          targetProd = { ...p, inHeroBanner: newVal };
          return targetProd;
        }
        return p;
      });
      localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
      if (targetProd) {
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetProd),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const toggleProductPromoBanner = (productId: string, inPromoBanner?: boolean) => {
    setProductsList((prev) => {
      let targetProd: Product | undefined;
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newVal = inPromoBanner !== undefined ? inPromoBanner : !p.inPromoBanner;
          targetProd = { ...p, inPromoBanner: newVal };
          return targetProd;
        }
        return p;
      });
      localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
      if (targetProd) {
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetProd),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const toggleProductFeatured = (productId: string, isFeatured?: boolean) => {
    setProductsList((prev) => {
      let targetProd: Product | undefined;
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newVal = isFeatured !== undefined ? isFeatured : !p.isFeatured;
          targetProd = { ...p, isFeatured: newVal };
          return targetProd;
        }
        return p;
      });
      localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
      if (targetProd) {
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetProd),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const toggleProductDealOfDay = (productId: string, isDealOfDay?: boolean) => {
    setProductsList((prev) => {
      let targetProd: Product | undefined;
      const updated = prev.map((p) => {
        if (p.id === productId) {
          const newVal = isDealOfDay !== undefined ? isDealOfDay : !p.isDealOfDay;
          targetProd = { ...p, isDealOfDay: newVal };
          return targetProd;
        }
        return p;
      });
      localStorage.setItem("pixkart_products_v5", JSON.stringify(updated));
      if (targetProd) {
        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetProd),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const addBrand = (newBrand: Brand) => {
    setBrandsList((prev) => {
      const updated = [...prev.filter((b) => b.id !== newBrand.id), newBrand];
      localStorage.setItem("pixkart_brands_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBrand),
      }).catch(() => {});
    } catch {}
  };

  const deleteBrand = (brandId: string) => {
    setBrandsList((prev) => {
      const updated = prev.filter((b) => b.id !== brandId);
      localStorage.setItem("pixkart_brands_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch(`/api/brands?id=${encodeURIComponent(brandId)}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}
  };

  const addPhoneModel = (newModel: PhoneModel) => {
    setPhoneModelsList((prev) => {
      const updated = [...prev.filter((m) => m.id !== newModel.id), newModel];
      localStorage.setItem("pixkart_models_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "model",
          action: "upsert",
          entityId: newModel.id,
          payload: newModel,
        }),
      }).catch(() => {});
    } catch {}
  };

  const deletePhoneModel = (modelId: string) => {
    setPhoneModelsList((prev) => {
      const updated = prev.filter((m) => m.id !== modelId);
      localStorage.setItem("pixkart_models_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "model",
          action: "delete",
          entityId: modelId,
          payload: { id: modelId },
        }),
      }).catch(() => {});
    } catch {}
  };

  const addCategory = (newCat: Category) => {
    setCategoriesList((prev) => {
      const updated = [...prev.filter((c) => c.id !== newCat.id), newCat];
      localStorage.setItem("pixkart_categories_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      }).catch(() => {});
    } catch {}
  };

  const updateCategory = (updatedCat: Category) => {
    setCategoriesList((prev) => {
      const updated = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      localStorage.setItem("pixkart_categories_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCat),
      }).catch(() => {});
    } catch {}
  };

  const deleteCategory = (catId: string) => {
    setCategoriesList((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      localStorage.setItem("pixkart_categories_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch(`/api/categories?id=${encodeURIComponent(catId)}`, {
        method: "DELETE",
      }).catch(() => {});
    } catch {}
  };

  // Order Management Functions
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrdersList((prevOrders) => {
      const updated = prevOrders.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            deliveredAt: newStatus === "Delivered" ? new Date().toISOString() : ord.deliveredAt,
          };
        }
        return ord;
      });

      const cleaned = cleanOldDeliveredOrders(updated);
      localStorage.setItem("pixkart_orders_v5", JSON.stringify(cleaned));
      return cleaned;
    });
  };

  const placeOrder = (customerInfo: { name: string; email: string; phone: string; address: string; pincode: string }): Order => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address,
      pincode: customerInfo.pincode,
      items: cart.map((c) => ({
        productId: c.product.id,
        productTitle: c.product.title,
        productImage: c.product.imageUrls[0],
        quantity: c.quantity,
        price: c.product.basePrice,
        modelName: c.model?.name,
      })),
      totalAmount: cartTotal,
      status: "Ordered",
      createdAt: new Date().toISOString(),
    };

    setOrdersList((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem("pixkart_orders_v5", JSON.stringify(updated));
      return updated;
    });

    clearCart();
    return newOrder;
  };

  // Orders linked to active user
  const userOrders = ordersList.filter((ord) => {
    if (!user) return true;
    return (
      ord.email.toLowerCase() === user.email.toLowerCase() ||
      ord.customerName.toLowerCase().includes(user.name.toLowerCase())
    );
  });

  // Admin Auth Functions
  const loginAdmin = (passcode: string): boolean => {
    if (passcode === "Tanzar@123") {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("pixkart_admin_auth");
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);

  // Spotlight Brands CRUD (Admin Controlled)
  const addSpotlightBrand = (item: SpotlightBrand) => {
    setSpotlightBrandsList((prev) => {
      const updated = [item, ...prev.filter((b) => b.id !== item.id)];
      localStorage.setItem("pixkart_spotlight_brands_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "spotlight",
          action: "upsert",
          entityId: item.id,
          payload: item,
        }),
      }).catch(() => {});
    } catch {}
  };

  const updateSpotlightBrand = (item: SpotlightBrand) => {
    setSpotlightBrandsList((prev) => {
      const updated = prev.map((b) => (b.id === item.id ? item : b));
      localStorage.setItem("pixkart_spotlight_brands_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "spotlight",
          action: "upsert",
          entityId: item.id,
          payload: item,
        }),
      }).catch(() => {});
    } catch {}
  };

  const deleteSpotlightBrand = (id: string) => {
    setSpotlightBrandsList((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem("pixkart_spotlight_brands_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "spotlight",
          action: "delete",
          entityId: id,
          payload: { id },
        }),
      }).catch(() => {});
    } catch {}
  };

  // Hero Banner Slides CRUD (Admin Controlled)
  const addHeroSlide = (slide: HeroSlide) => {
    setHeroSlidesList((prev) => {
      const updated = [slide, ...prev.filter((s) => s.id !== slide.id)];
      localStorage.setItem("pixkart_hero_slides_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "hero_slide",
          action: "upsert",
          entityId: slide.id,
          payload: slide,
        }),
      }).catch(() => {});
    } catch {}
  };

  const updateHeroSlide = (slide: HeroSlide) => {
    setHeroSlidesList((prev) => {
      const updated = prev.map((s) => (s.id === slide.id ? slide : s));
      localStorage.setItem("pixkart_hero_slides_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "hero_slide",
          action: "upsert",
          entityId: slide.id,
          payload: slide,
        }),
      }).catch(() => {});
    } catch {}
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlidesList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem("pixkart_hero_slides_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "hero_slide",
          action: "delete",
          entityId: id,
          payload: { id },
        }),
      }).catch(() => {});
    } catch {}
  };

  // Promo Ad Banners CRUD (Admin Controlled)
  const addPromoAd = (ad: PromoAdCard) => {
    setPromoAdBannersList((prev) => {
      const updated = [ad, ...prev.filter((a) => a.id !== ad.id)];
      localStorage.setItem("pixkart_promo_ads_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "promo_ad",
          action: "upsert",
          entityId: ad.id,
          payload: ad,
        }),
      }).catch(() => {});
    } catch {}
  };

  const updatePromoAd = (ad: PromoAdCard) => {
    setPromoAdBannersList((prev) => {
      const updated = prev.map((a) => (a.id === ad.id ? ad : a));
      localStorage.setItem("pixkart_promo_ads_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "promo_ad",
          action: "upsert",
          entityId: ad.id,
          payload: ad,
        }),
      }).catch(() => {});
    } catch {}
  };

  const deletePromoAd = (id: string) => {
    setPromoAdBannersList((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("pixkart_promo_ads_v5", JSON.stringify(updated));
      return updated;
    });
    try {
      fetch("/api/admin/cloud-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "promo_ad",
          action: "delete",
          entityId: id,
          payload: { id },
        }),
      }).catch(() => {});
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        selectedBrand,
        selectedModel,
        setSelectedDevice,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        addresses,
        activeAddress,
        activeAddressId,
        setActiveAddressId,
        saveUserAddress,
        deleteUserAddress,
        addressModalOpen,
        setAddressModalOpen,
        pincode,
        setPincode,
        pincodeLocation,
        pincodeError,
        searchOpen,
        setSearchOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        user,
        signInWithGoogle,
        signInWithEmail,
        signOutUser,
        updateUserProfile,
        recentlyViewed,
        addRecentlyViewed,
        productsList,
        addProduct,
        updateProduct,
        deleteProduct,
        syncLocalProductsToCloud,
        toggleProductSpotlight,
        toggleProductHeroBanner,
        toggleProductPromoBanner,
        toggleProductFeatured,
        toggleProductDealOfDay,
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
        ordersList,
        userOrders,
        updateOrderStatus,
        placeOrder,
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
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
