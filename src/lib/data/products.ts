import { categories } from "./categories";
import { phoneModels, PhoneModel } from "./models";

export interface ProductVariant {
  id: string;
  productId: string;
  phoneModelId?: string;
  storage?: string;
  color?: string;
  sku: string;
  stock: number;
  priceOverride?: number;
  mrpOverride?: number;
  imageUrls: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  brandId: string;
  basePrice: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
  imageUrls: string[];
  isFeatured?: boolean;
  isDealOfDay?: boolean;
  isPixKartAssured?: boolean;
  requiresPhoneModel?: boolean;
  variantsOptions?: {
    color?: string[];
  };
  stockStatus?: string;
  badgeText?: string;
  inSpotlight?: boolean;
  inHeroBanner?: boolean;
  inPromoBanner?: boolean;
}

// 100% Clean Empty Catalog - Products are populated exclusively via Admin Portal & MySQL Backend
export const products: Product[] = [];

export const productVariants: ProductVariant[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
