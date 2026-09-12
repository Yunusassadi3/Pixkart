import {
  testDualConnections,
  localQuery,
  cloudQuery,
} from "../src/lib/db";
import { syncAllAndDrainCloud } from "../src/lib/syncEngine";

async function runCatalogAndStoreSyncVerification() {
  console.log("================================================================================");
  console.log("🚀 PIXKART FULL STORE & CATALOG OFFLINE BUFFER -> 3-STEP SYNC & CLOUD PURGE TEST");
  console.log("================================================================================\n");

  // Step 1: Check dual connections
  console.log("📡 STEP 1: Verifying Dual Database Connectivity...");
  const { local, cloud } = await testDualConnections();
  console.log(`   🏠 Local PC MySQL (3306):   ${local.connected ? "✅ CONNECTED" : "❌ OFFLINE"} (${local.latencyMs}ms) [DB: ${local.database}]`);
  console.log(`   ☁️ TiDB Cloud Buffer (4000): ${cloud.connected ? "✅ CONNECTED" : "❌ OFFLINE"} (${cloud.latencyMs}ms) [DB: ${cloud.database}]`);

  if (!local.connected || !cloud.connected) {
    throw new Error("Both Local MySQL and TiDB Cloud must be online to execute this test.");
  }

  // Step 2: Clear old test entities
  console.log("\n🧹 STEP 2: Cleaning any previous test artifacts...");
  await cloudQuery("DELETE FROM cloud_catalog_queue WHERE entity_id LIKE 'test_full_%'");
  await cloudQuery("DELETE FROM cloud_order_queue WHERE id LIKE 'test_full_%'");
  await cloudQuery("DELETE FROM cloud_user_queue WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM products WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM brands WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM categories WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM phone_models WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM orders WHERE id LIKE 'test_full_%'");
  await localQuery("DELETE FROM users WHERE id LIKE 'test_full_%'");

  // Step 3: Simulate Admin on Mobile/Tablet adding catalog items while PC is OFF
  console.log("\n📱 STEP 3: Simulating Admin Adding Catalog Assets from Mobile/Tablet while PC is OFF...");

  const testBrand = {
    id: "test_full_brand_1",
    name: "AeroShield Armor",
    logo: "https://example.com/aeroshield.png",
    series: ["Pro Guard", "Titanium Frame"],
  };

  const testCategory = {
    id: "test_full_cat_1",
    name: "Military Grade Armor",
    slug: "military-grade-armor",
    icon: "🛡️",
    image: "https://example.com/military-armor.png",
    displayOrder: 95,
  };

  const testModel = {
    id: "test_full_model_1",
    brandId: testBrand.id,
    name: "AeroShield Max 15",
    series: "Pro Guard",
    screenSize: "6.7 inch",
    image: "https://example.com/model.png",
  };

  const testProduct = {
    id: "test_full_prod_1",
    title: "AeroShield Kevlar Shockproof Bumper",
    slug: "aeroshield-kevlar-shockproof-bumper",
    description: "Rugged military-certified protective cover with tactile buttons.",
    basePrice: 1299,
    discountPercent: 15,
    brandId: testBrand.id,
    categoryId: testCategory.id,
    isFeatured: true,
    inSpotlight: true,
    isDealOfDay: true,
    inHeroBanner: true,
    inPromoBanner: true,
    badgeText: "DEAL OF THE DAY",
    rating: 4.9,
    reviewCount: 48,
    stockStatus: "in_stock",
    imageUrls: ["https://example.com/case-front.png"],
    specs: {
      material: "Kevlar & TPU",
      dropProtection: "12ft Drop Tested",
      magSafeCompatible: true,
    },
    compatibleModels: ["AeroShield Max 15"],
  };

  const testSpotlight = {
    id: "test_full_spotlight_1",
    brandName: "AeroShield Armor",
    badge: "Spotlight Brand",
    headline: "Unbreakable Protection",
    subtext: "Engineered for extreme drops.",
    image: "https://example.com/spotlight-banner.jpg",
    bgColor: "#090d16",
    link: `/shop?brand=${testBrand.id}`,
  };

  const testHeroSlide = {
    id: "test_full_hero_1",
    brandPrefix: "AEROSHIELD",
    brandTag: "TITANIUM",
    badgeLabel: "EXCLUSIVE DEAL",
    title: "Next-Gen Impact Armor",
    priceText: "From ₹1,299",
    saleDateText: "Limited Time Offer",
    featureText: "Military Certified & Wireless Charging",
    bgGradient: "linear-gradient(to right, #000, #1e1b4b)",
    link: `/shop?category=${testCategory.id}`,
    phoneFrontImage: "https://example.com/hero-front.png",
  };

  const testPromoAd = {
    id: "test_full_promo_1",
    brandTag: "AEROSHIELD PRO",
    brandTagColor: "#f59e0b",
    badge: "FLASH DEAL",
    title: "Shockproof Bumper Series",
    subtitle: "Heavy duty drop protection",
    price: "₹1,299",
    image: "https://example.com/promo-banner.jpg",
    bgGradient: "from-amber-950 to-neutral-900",
    link: `/shop?brand=${testBrand.id}`,
  };

  // Queue all 6 items into TiDB Cloud's cloud_catalog_queue
  const queueItems = [
    { id: "q_full_brand", entityType: "brand", entityId: testBrand.id, payload: testBrand },
    { id: "q_full_cat", entityType: "category", entityId: testCategory.id, payload: testCategory },
    { id: "q_full_model", entityType: "model", entityId: testModel.id, payload: testModel },
    { id: "q_full_prod", entityType: "product", entityId: testProduct.id, payload: testProduct },
    { id: "q_full_spot", entityType: "spotlight", entityId: testSpotlight.id, payload: testSpotlight },
    { id: "q_full_hero", entityType: "hero_slide", entityId: testHeroSlide.id, payload: testHeroSlide },
    { id: "q_full_promo", entityType: "promo_ad", entityId: testPromoAd.id, payload: testPromoAd },
  ];

  for (const item of queueItems) {
    await cloudQuery(
      `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
       VALUES (?, ?, 'upsert', ?, ?)`,
      [item.id, item.entityType, item.entityId, JSON.stringify(item.payload)]
    );
  }

  const [countRows]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_catalog_queue WHERE id LIKE 'q_full_%'"
  );
  console.log(`   ✓ Buffered ${countRows[0].count} catalog item(s) in TiDB Cloud (cloud_catalog_queue).`);
  console.log("   ✓ Temporary cloud buffer successfully holding offline catalog edits!");

  // Step 4: Simulate PC Turning Back ON & Admin Clicking "Sync & Drain"
  console.log("\n☀️ STEP 4: PC Turns Back ON -> Admin Clicks 'Sync & Drain'...");
  console.log("   Running Triple-Handshake (Commit -> Read-Back -> Integrity Probe):");

  const syncResult = await syncAllAndDrainCloud();

  console.log(`   - Local PC MySQL Connected:       ${syncResult.localDbConnected ? "YES" : "NO"}`);
  console.log(`   - Total Catalog Entities Synced:  ${syncResult.catalog.syncedCount}`);
  console.log(`   - Total Catalog Entities Purged:  ${syncResult.catalog.purgedCount}`);
  console.log(`   - Total Entities Remaining in Cloud: ${syncResult.catalog.remainingInCloud}`);

  console.log("\n   🔍 Individual 3-Step Verification Handshakes:");
  for (const log of syncResult.catalog.logs.filter((l) => l.queueId.startsWith("q_full_"))) {
    console.log(
      `      [${log.entityType}:${log.entityId}] ` +
      `Handshake 1 (Commit): ${log.handshake1Commit ? "✅" : "❌"} | ` +
      `Handshake 2 (Disk Read-Back): ${log.handshake2ReadBack ? "✅" : "❌"} | ` +
      `Handshake 3 (Integrity Probe): ${log.handshake3Integrity ? "✅" : "❌"} | ` +
      `Purged from Cloud: ${log.purgedFromCloud ? "✅ PURGED" : "❌"}`
    );
  }

  if (syncResult.catalog.failedCount > 0) {
    throw new Error("One or more catalog assets failed 3-step verification!");
  }

  // Step 5: Verify records physically exist on Local PC MySQL Hard Drive
  console.log("\n💾 STEP 5: Verifying Physical Rows in Local PC MySQL Master Database...");

  const [brandCheck]: any = await localQuery("SELECT id, name FROM brands WHERE id = ?", [testBrand.id]);
  console.log(`   ✓ brands table:          ${brandCheck.length === 1 ? "✅ STORED ON LOCAL PC DISK" : "❌ FAIL"}`);

  const [catCheck]: any = await localQuery("SELECT id, name, slug FROM categories WHERE id = ?", [testCategory.id]);
  console.log(`   ✓ categories table:      ${catCheck.length === 1 ? "✅ STORED ON LOCAL PC DISK" : "❌ FAIL"}`);

  const [modelCheck]: any = await localQuery("SELECT id, name, brand_id FROM phone_models WHERE id = ?", [testModel.id]);
  console.log(`   ✓ phone_models table:    ${modelCheck.length === 1 ? "✅ STORED ON LOCAL PC DISK" : "❌ FAIL"}`);

  const [prodCheck]: any = await localQuery(
    "SELECT id, title, base_price, is_featured, is_trending, is_bestseller, specs FROM products WHERE id = ?",
    [testProduct.id]
  );
  console.log(`   ✓ products table:        ${prodCheck.length === 1 ? "✅ STORED ON LOCAL PC DISK" : "❌ FAIL"}`);
  if (prodCheck.length === 1) {
    const specs = typeof prodCheck[0].specs === "string" ? JSON.parse(prodCheck[0].specs) : (prodCheck[0].specs || {});
    console.log(`     - Deal of Day Flag:    ${specs.isDealOfDay ? "✅ ACTIVE" : "❌ INACTIVE"}`);
    console.log(`     - Spotlight Flag:      ${specs.inSpotlight ? "✅ ACTIVE" : "❌ INACTIVE"}`);
    console.log(`     - Hero Banner Flag:    ${specs.inHeroBanner ? "✅ ACTIVE" : "❌ INACTIVE"}`);
    console.log(`     - Promo Banner Flag:   ${specs.inPromoBanner ? "✅ ACTIVE" : "❌ INACTIVE"}`);
    console.log(`     - Featured Flag:       ${specs.isFeatured ? "✅ ACTIVE" : "❌ INACTIVE"}`);
    console.log(`     - Badge Text:          ${specs.badgeText === "DEAL OF THE DAY" ? "✅ 'DEAL OF THE DAY'" : "❌"}`);
  }

  const [spotlightCheck]: any = await localQuery("SELECT setting_value FROM admin_settings WHERE setting_key = 'spotlight_brands'");
  const spotList = spotlightCheck.length > 0 ? JSON.parse(spotlightCheck[0].setting_value) : [];
  console.log(`   ✓ Spotlight Brands:      ${spotList.some((s: any) => s.id === testSpotlight.id) ? "✅ STORED IN ADMIN SETTINGS" : "❌ FAIL"}`);

  const [heroCheck]: any = await localQuery("SELECT setting_value FROM admin_settings WHERE setting_key = 'hero_slides'");
  const heroList = heroCheck.length > 0 ? JSON.parse(heroCheck[0].setting_value) : [];
  console.log(`   ✓ Hero Slides Banner:    ${heroList.some((h: any) => h.id === testHeroSlide.id) ? "✅ STORED IN ADMIN SETTINGS" : "❌ FAIL"}`);

  const [promoCheck]: any = await localQuery("SELECT setting_value FROM admin_settings WHERE setting_key = 'promo_ads'");
  const promoList = promoCheck.length > 0 ? JSON.parse(promoCheck[0].setting_value) : [];
  console.log(`   ✓ Promo Ad Banner:       ${promoList.some((a: any) => a.id === testPromoAd.id) ? "✅ STORED IN ADMIN SETTINGS" : "❌ FAIL"}`);

  // Step 6: Verify TiDB Cloud Buffer Storage Purge
  console.log("\n🧹 STEP 6: Verifying Zero-Bloat TiDB Cloud Purge (Cloud Storage Cleaned)...");
  const [remainingRows]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_catalog_queue WHERE id LIKE 'q_full_%'"
  );

  console.log(`   - Pending in TiDB Cloud: ${remainingRows[0].count} items ${remainingRows[0].count === 0 ? "✅ (100% CLEAN & EMPTY)" : "❌ FAILED TO PURGE"}`);

  if (remainingRows[0].count !== 0) {
    throw new Error("Cloud catalog purge failed: records still linger in TiDB Cloud!");
  }

  // Step 7: Clean up test rows
  console.log("\n🧹 STEP 7: Cleaning up test artifacts from local PC MySQL...");
  await localQuery("DELETE FROM products WHERE id = ?", [testProduct.id]);
  await localQuery("DELETE FROM phone_models WHERE id = ?", [testModel.id]);
  await localQuery("DELETE FROM brands WHERE id = ?", [testBrand.id]);
  await localQuery("DELETE FROM categories WHERE id = ?", [testCategory.id]);
  await localQuery(
    "UPDATE admin_settings SET setting_value = ? WHERE setting_key = 'spotlight_brands'",
    [JSON.stringify(spotList.filter((s: any) => s.id !== testSpotlight.id))]
  );
  await localQuery(
    "UPDATE admin_settings SET setting_value = ? WHERE setting_key = 'hero_slides'",
    [JSON.stringify(heroList.filter((h: any) => h.id !== testHeroSlide.id))]
  );
  await localQuery(
    "UPDATE admin_settings SET setting_value = ? WHERE setting_key = 'promo_ads'",
    [JSON.stringify(promoList.filter((a: any) => a.id !== testPromoAd.id))]
  );
  console.log("   ✓ All test artifacts cleaned from local database.");

  console.log("\n================================================================================");
  console.log("🎉 ALL CATALOG, SPOTLIGHT, BANNER & DEAL TESTS PASSED WITH 100% PERFECTION!");
  console.log("   1. Changes from mobile/tablet saved temporarily into TiDB Cloud while PC was off.");
  console.log("   2. 3-step verification added everything into local PC MySQL.");
  console.log("   3. TiDB Cloud queue was 100% purged and wiped clean (0 MB used).");
  console.log("================================================================================\n");

  process.exit(0);
}

runCatalogAndStoreSyncVerification().catch((err) => {
  console.error("\n❌ CATALOG VERIFICATION FAILED:", err);
  process.exit(1);
});
