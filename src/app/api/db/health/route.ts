import { NextResponse } from "next/server";
import { testDualConnections, query, cloudQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { local, cloud } = await testDualConnections();

  let tableCounts: Record<string, number> = {
    products: 0,
    brands: 0,
    categories: 0,
    phoneModels: 0,
    orders: 0,
    cloudQueuePending: 0,
    cloudOrdersPending: 0,
    cloudUserQueuePending: 0,
    cloudUsersPending: 0,
    cloudCatalogQueuePending: 0,
    cloudProductsPending: 0,
    cloudCategoriesPending: 0,
    cloudBrandsPending: 0,
    cloudModelsPending: 0,
    cloudSpotlightPending: 0,
    cloudBannersPending: 0,
    cloudFeaturedPending: 0,
    cloudDealsPending: 0,
    totalCloudQueuePending: 0,
    users: 0,
    addresses: 0,
  };

  // If local MySQL is online, fetch master table counts
  if (local.connected) {
    try {
      const [productCount]: any = await query("SELECT COUNT(*) as count FROM products");
      const [brandCount]: any = await query("SELECT COUNT(*) as count FROM brands");
      const [categoryCount]: any = await query("SELECT COUNT(*) as count FROM categories");
      const [modelCount]: any = await query("SELECT COUNT(*) as count FROM phone_models");
      const [orderCount]: any = await query("SELECT COUNT(*) as count FROM orders");
      const [userCount]: any = await query("SELECT COUNT(*) as count FROM users");
      const [addressCount]: any = await query("SELECT COUNT(*) as count FROM addresses");

      tableCounts.products = productCount?.[0]?.count || 0;
      tableCounts.brands = brandCount?.[0]?.count || 0;
      tableCounts.categories = categoryCount?.[0]?.count || 0;
      tableCounts.phoneModels = modelCount?.[0]?.count || 0;
      tableCounts.orders = orderCount?.[0]?.count || 0;
      tableCounts.users = userCount?.[0]?.count || 0;
      tableCounts.addresses = addressCount?.[0]?.count || 0;
    } catch {}
  }

  // Always check TiDB Cloud buffers (accessible 24/7 even when PC is off)
  if (cloud.connected) {
    try {
      const [orderQueueCount]: any = await cloudQuery("SELECT COUNT(*) as count FROM cloud_order_queue");
      const [userQueueCount]: any = await cloudQuery("SELECT COUNT(*) as count FROM cloud_user_queue");
      const [catalogRows]: any = await cloudQuery("SELECT id, entity_type, payload FROM cloud_catalog_queue");

      const orderPending = orderQueueCount?.[0]?.count || 0;
      const userPending = userQueueCount?.[0]?.count || 0;
      const catalogPending = catalogRows?.length || 0;

      let productsPending = 0;
      let categoriesPending = 0;
      let brandsPending = 0;
      let modelsPending = 0;
      let spotlightPending = 0;
      let bannersPending = 0;
      let featuredPending = 0;
      let dealsPending = 0;

      if (Array.isArray(catalogRows)) {
        for (const row of catalogRows) {
          const type = row.entity_type;
          let p: any = {};
          try {
            p = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload || {};
          } catch {}

          if (type === "product") {
            productsPending++;
            if (p.inSpotlight) spotlightPending++;
            if (p.inHeroBanner || p.inPromoBanner) bannersPending++;
            if (p.isFeatured) featuredPending++;
            if (p.isDealOfDay || p.badgeText?.toLowerCase().includes("bestseller")) dealsPending++;
          } else if (type === "category") {
            categoriesPending++;
          } else if (type === "brand") {
            brandsPending++;
          } else if (type === "model") {
            modelsPending++;
          } else if (type === "spotlight") {
            spotlightPending++;
          } else if (type === "hero_slide" || type === "promo_ad") {
            bannersPending++;
          }
        }
      }

      tableCounts.cloudQueuePending = orderPending;
      tableCounts.cloudOrdersPending = orderPending;
      tableCounts.cloudUserQueuePending = userPending;
      tableCounts.cloudUsersPending = userPending;
      tableCounts.cloudCatalogQueuePending = catalogPending;
      tableCounts.cloudProductsPending = productsPending;
      tableCounts.cloudCategoriesPending = categoriesPending;
      tableCounts.cloudBrandsPending = brandsPending;
      tableCounts.cloudModelsPending = modelsPending;
      tableCounts.cloudSpotlightPending = spotlightPending;
      tableCounts.cloudBannersPending = bannersPending;
      tableCounts.cloudFeaturedPending = featuredPending;
      tableCounts.cloudDealsPending = dealsPending;
      tableCounts.totalCloudQueuePending = orderPending + userPending + catalogPending;
    } catch {}
  }

  return NextResponse.json({
    status: local.connected ? "connected" : cloud.connected ? "cloud_buffer_active" : "disconnected",
    local: {
      status: local.connected ? "connected" : "offline",
      host: local.host || "127.0.0.1:3306",
      database: local.database || "pixkart_db",
      latencyMs: local.latencyMs,
      error: local.error,
    },
    cloud: {
      status: cloud.connected ? "connected" : "offline",
      host: cloud.host || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000",
      database: cloud.database || "test",
      latencyMs: cloud.latencyMs,
      error: cloud.error,
    },
    // Backwards-compatible fields
    database: local.connected ? local.database : cloud.database,
    host: local.connected ? local.host : cloud.host,
    latencyMs: local.connected ? local.latencyMs : cloud.latencyMs,
    tableCounts,
    timestamp: new Date().toISOString(),
  });
}

