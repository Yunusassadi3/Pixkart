import ProductDetailClient from "./ProductDetailClient";
import { products } from "@/lib/data/products";

export const dynamicParams = true;

export function generateStaticParams() {
  if (products.length === 0) {
    return [{ slug: "item" }];
  }
  return products.map((product) => ({
    slug: product.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ProductDetailClient slug={resolvedParams.slug} />;
}
