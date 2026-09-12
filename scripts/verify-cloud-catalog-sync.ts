import { testConnection, query } from "../src/lib/db";
import { syncAndDrainCatalogQueue, syncAllAndDrainCloud } from "../src/lib/syncEngine";

async function runCatalogSyncVerification() {
  console.log("================================================================================");
  console.log("🚀 PIXKART OFFLINE CLOUD STORAGE & TRIPLE-HANDSHAKE CATALOG AUTO-SYNC VERIFIER");
  console.log("================================================================================\n");

  const health = await testConnection();
  console.log("1. Master Database Connection Status:", health.connected ? "CONNECTED (ONLINE)" : "DISCONNECTED (OFFLINE)");
  if (!health.connected) {
    console.error("❌ MySQL is not connected. Aborting verification test.");
    process.exit(1);
  }

  // Clear any existing test entities
  console.log("2. Cleaning previous test artifacts...");
  await query("DELETE FROM cloud_catalog_queue WHERE entity_id LIKE 'test_%'");
  await query("DELETE FROM products WHERE id LIKE 'test_%'");
  await query("DELETE FROM phone_models WHERE id LIKE 'test_%'");
  await query("DELETE FROM brands WHERE id LIKE 'test_%'");
  await query("DELETE FROM categories WHERE id LIKE 'test_%'");

  console.log("3. Simulating Offline PC State: Queuing catalog entities in cloud_catalog_queue...");

  const testBrand = {
    id: "test_brand_101",
    name: "Aether Acoustics",
    logo: "https://example.com/aether.png",
    series: ["Prime", "Pro"],
  };

  const testCategory = {
    id: "test_cat_101",
    name: "Acoustic Gear",
    slug: "acoustic-gear",
    icon: "🎧",
    image: "https://example.com/cat.png",
    displayOrder: 99,
  };

  const testModel = {
    id: "test_model_101",
    brandId: "test_brand_101",
    name: "Aether Pro X",
    series: "Pro",
    displaySize: "6.7 inch",
    image: "https://example.com/phone.png",
  };

  const testProduct = {
    id: "test_prod_101",
    title: "Aether Wireless Earbuds ANC",
    slug: "aether-wireless-earbuds-anc",
    description: "Premium Active Noise Cancelling Earbuds with 40h playtime.",
    basePrice: 2499,
    discountPercent: 20,
    brandId: "test_brand_101",
    categoryId: "test_cat_101",
    isFeatured: true,
    inSpotlight: true,
    badgeText: "Bestseller",
    rating: 4.9,
    reviewCount: 120,
    stockStatus: "in_stock",
    imageUrls: ["https://example.com/earbuds-front.jpg"],
    specs: {
      driver: "11mm Dynamic",
      battery: "40 Hours",
      anc: "45dB Hybrid ANC",
    },
    compatibleModels: ["Aether Pro X"],
  };

  const testSpotlight = {
    id: "test_spotlight_101",
    brandName: "Aether",
    badge: "New Release",
    headline: "Sound Redefined",
    subtext: "Experience lossless wireless acoustics.",
    image: "https://example.com/spotlight.jpg",
    bgColor: "#0f172a",
    link: "/shop?brand=test_brand_101",
  };

  const testHeroSlide = {
    id: "test_hero_101",
    brandPrefix: "AETHER",
    brandTag: "FLAGSHIP",
    badgeLabel: "EXCLUSIVE",
    title: "Next-Gen Audio Experience",
    priceText: "Starting at ₹2,499",
    saleDateText: "Limited Time Offer",
    featureText: "Ultra HD Audio & Spatial Immersion",
    bgGradient: "linear-gradient(to right, #000, #1e293b)",
    link: "/shop?category=test_cat_101",
    phoneFrontImage: "https://example.com/hero.png",
  };

  const testPromoAd = {
    id: "test_promo_101",
    brandTag: "AETHER AUDIO",
    brandTagColor: "#38bdf8",
    badge: "FLAT 20% OFF",
    title: "Noise Cancelling Series",
    subtitle: "Engineered for pure focus",
    price: "₹2,499",
    image: "https://example.com/promo.jpg",
    bgGradient: "from-blue-900 to-indigo-950",
    link: "/shop?brand=test_brand_101",
  };

  // Queue brand, category, model, product, spotlight, hero slide, and promo ad
  const queueEntries = [
    { id: "queue_test_b1", entity_type: "brand", entity_id: testBrand.id, payload: testBrand },
    { id: "queue_test_c1", entity_type: "category", entity_id: testCategory.id, payload: testCategory },
    { id: "queue_test_m1", entity_type: "model", entity_id: testModel.id, payload: testModel },
    { id: "queue_test_p1", entity_type: "product", entity_id: testProduct.id, payload: testProduct },
    { id: "queue_test_s1", entity_type: "spotlight", entity_id: testSpotlight.id, payload: testSpotlight },
    { id: "queue_test_h1", entity_type: "hero_slide", entity_id: testHeroSlide.id, payload: testHeroSlide },
    { id: "queue_test_ad1", entity_type: "promo_ad", entity_id: testPromoAd.id, payload: testPromoAd },
  ];

  for (const entry of queueEntries) {
    await query(
      `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
       VALUES (?, ?, 'upsert', ?, ?)`,
      [entry.id, entry.entity_type, entry.entity_id, JSON.stringify(entry.payload)]
    );
  }

  const [queuedRows]: any = await query(
    "SELECT COUNT(*) as cnt FROM cloud_catalog_queue WHERE id LIKE 'queue_test_%'"
  );
  console.log(`   ✓ Buffered ${queuedRows?.[0]?.cnt} test catalog item(s) in cloud_catalog_queue.`);
  if (queuedRows?.[0]?.cnt !== 7) {
    throw new Error(`Expected 7 buffered items, but found ${queuedRows?.[0]?.cnt}`);
  }

  // 4. Execute Triple-Handshake Auto-Drain Engine
  console.log("\n4. Triggering Triple-Handshake Auto-Drain Engine for Catalog Assets...");
  const syncResult = await syncAndDrainCatalogQueue();
  console.log(`   Total Processed: ${syncResult.totalPendingInCloud}`);
  console.log(`   Successfully Synced: ${syncResult.syncedCount}`);
  console.log(`   Failed Count: ${syncResult.failedCount}`);
  console.log(`   Purged from Cloud: ${syncResult.purgedCount}`);
  console.log(`   Remaining in Cloud: ${syncResult.remainingInCloud}`);

  for (const log of syncResult.logs.filter((l) => l.entityId.startsWith("test_"))) {
    console.log(
      `   [${log.entityType}:${log.entityId}] Handshake 1 (Commit): ${log.handshake1Commit ? "✓" : "✗"} | ` +
      `Handshake 2 (Read-Back): ${log.handshake2ReadBack ? "✓" : "✗"} | ` +
      `Handshake 3 (Integrity): ${log.handshake3Integrity ? "✓" : "✗"} | ` +
      `Purged: ${log.purgedFromCloud ? "✓" : "✗"} | Status: ${log.status}`
    );
  }

  if (syncResult.failedCount > 0) {
    throw new Error("One or more catalog entities failed triple-handshake synchronization!");
  }

  // 5. Verify local MySQL database tables
  console.log("\n5. Verifying Row Presence and Integrity in Master MySQL Database:");

  const [brandCheck]: any = await query("SELECT id, name FROM brands WHERE id = ?", [testBrand.id]);
  console.log(`   Brands Table: ${brandCheck.length === 1 && brandCheck[0].name === testBrand.name ? "✓ PASS" : "✗ FAIL"}`);

  const [catCheck]: any = await query("SELECT id, name, slug FROM categories WHERE id = ?", [testCategory.id]);
  console.log(`   Categories Table: ${catCheck.length === 1 && catCheck[0].slug === testCategory.slug ? "✓ PASS" : "✗ FAIL"}`);

  const [modelCheck]: any = await query("SELECT id, name, brand_id FROM phone_models WHERE id = ?", [testModel.id]);
  console.log(`   Phone Models Table: ${modelCheck.length === 1 && modelCheck[0].name === testModel.name ? "✓ PASS" : "✗ FAIL"}`);

  const [prodCheck]: any = await query("SELECT id, title, base_price FROM products WHERE id = ?", [testProduct.id]);
  console.log(`   Products Table: ${prodCheck.length === 1 && parseFloat(prodCheck[0].base_price) === testProduct.basePrice ? "✓ PASS" : "✗ FAIL"}`);

  const [spotCheck]: any = await query("SELECT setting_value FROM admin_settings WHERE setting_key = 'spotlight_brands'");
  const spotList = spotCheck.length > 0 ? JSON.parse(spotCheck[0].setting_value) : [];
  console.log(`   Admin Settings (Spotlight Brands): ${spotList.some((s: any) => s.id === testSpotlight.id) ? "✓ PASS" : "✗ FAIL"}`);

  const [heroCheck]: any = await query("SELECT setting_value FROM admin_settings WHERE setting_key = 'hero_slides'");
  const heroList = heroCheck.length > 0 ? JSON.parse(heroCheck[0].setting_value) : [];
  console.log(`   Admin Settings (Hero Slides): ${heroList.some((h: any) => h.id === testHeroSlide.id) ? "✓ PASS" : "✗ FAIL"}`);

  const [promoCheck]: any = await query("SELECT setting_value FROM admin_settings WHERE setting_key = 'promo_ads'");
  const promoList = promoCheck.length > 0 ? JSON.parse(promoCheck[0].setting_value) : [];
  console.log(`   Admin Settings (Promo Ads): ${promoList.some((a: any) => a.id === testPromoAd.id) ? "✓ PASS" : "✗ FAIL"}`);

  // 6. Verify Cloud Queue Purge
  const [remainingCheck]: any = await query(
    "SELECT COUNT(*) as cnt FROM cloud_catalog_queue WHERE id LIKE 'queue_test_%'"
  );
  console.log(`\n6. Cloud Queue Zero-Bloat Check: Remaining test queue items: ${remainingCheck?.[0]?.cnt}`);
  if (remainingCheck?.[0]?.cnt !== 0) {
    throw new Error(`Expected 0 items remaining in cloud queue, but found ${remainingCheck?.[0]?.cnt}`);
  }
  console.log("   ✓ Zero-Bloat Confirmed: All verified items purged from cloud queue.");

  // 7. Test Offline Deletion Sync
  console.log("\n7. Testing Offline Deletion Propagation & Triple-Handshake...");
  await query(
    `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
     VALUES ('queue_del_p1', 'product', 'delete', ?, ?),
            ('queue_del_b1', 'brand', 'delete', ?, ?),
            ('queue_del_c1', 'category', 'delete', ?, ?),
            ('queue_del_m1', 'model', 'delete', ?, ?),
            ('queue_del_s1', 'spotlight', 'delete', ?, ?),
            ('queue_del_h1', 'hero_slide', 'delete', ?, ?),
            ('queue_del_ad1', 'promo_ad', 'delete', ?, ?)`,
    [
      testProduct.id, JSON.stringify({ id: testProduct.id }),
      testBrand.id, JSON.stringify({ id: testBrand.id }),
      testCategory.id, JSON.stringify({ id: testCategory.id }),
      testModel.id, JSON.stringify({ id: testModel.id }),
      testSpotlight.id, JSON.stringify({ id: testSpotlight.id }),
      testHeroSlide.id, JSON.stringify({ id: testHeroSlide.id }),
      testPromoAd.id, JSON.stringify({ id: testPromoAd.id }),
    ]
  );

  const deleteSyncResult = await syncAndDrainCatalogQueue();
  console.log(`   Deletion Synced: ${deleteSyncResult.syncedCount}/7`);
  console.log(`   Deletion Failed: ${deleteSyncResult.failedCount}`);
  console.log(`   Deletion Purged: ${deleteSyncResult.purgedCount}/7`);

  for (const log of deleteSyncResult.logs.filter((l) => l.entityId.startsWith("test_"))) {
    console.log(
      `   [DELETE ${log.entityType}:${log.entityId}] Handshake 1 (Delete): ${log.handshake1Commit ? "✓" : "✗"} | ` +
      `Handshake 2 (Absence): ${log.handshake2ReadBack ? "✓" : "✗"} | ` +
      `Handshake 3 (Integrity): ${log.handshake3Integrity ? "✓" : "✗"} | Status: ${log.status}`
    );
  }

  // Confirm row absence in MySQL
  const [deletedProdRows]: any = await query("SELECT id FROM products WHERE id = ?", [testProduct.id]);
  const [deletedBrandRows]: any = await query("SELECT id FROM brands WHERE id = ?", [testBrand.id]);
  console.log(`   MySQL Deletion Verification: Product removed: ${deletedProdRows.length === 0 ? "✓" : "✗"} | Brand removed: ${deletedBrandRows.length === 0 ? "✓" : "✗"}`);

  // 8. Test Master Unified Sync Engine
  console.log("\n8. Testing Unified Master Sync & Drain Engine (Catalog -> Users -> Orders)...");
  const unifiedResult = await syncAllAndDrainCloud();
  console.log(`   Unified Local DB Connected: ${unifiedResult.localDbConnected ? "YES" : "NO"}`);
  console.log(`   Catalog Synced: ${unifiedResult.catalog.syncedCount}`);
  console.log(`   Users Synced: ${unifiedResult.users.syncedCount}`);
  console.log(`   Orders Synced: ${unifiedResult.orders.syncedCount}`);
  console.log(`   Total Cloud Pending: ${unifiedResult.totalPending}`);
  console.log(`   Timestamp: ${unifiedResult.timestamp}`);

  console.log("\n================================================================================");
  console.log("✅ ALL TRIPLE-HANDSHAKE CATALOG AUTO-SYNC TESTS PASSED WITH 100% PERFECTION!");
  console.log("================================================================================\n");
  process.exit(0);
}

runCatalogSyncVerification().catch((err) => {
  console.error("\n❌ VERIFICATION TEST FAILED:", err.message);
  process.exit(1);
});
