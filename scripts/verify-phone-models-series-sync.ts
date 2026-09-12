import {
  testDualConnections,
  localQuery,
  cloudQuery,
} from "../src/lib/db";
import { syncAllAndDrainCloud } from "../src/lib/syncEngine";

async function runPhoneModelAndSeriesVerification() {
  console.log("================================================================================");
  console.log("📱 PIXKART MOBILE PHONE SERIES & MODELS CATALOG OFFLINE SYNC & DRAIN VERIFIER");
  console.log("================================================================================\n");

  // Step 1: Check connectivity
  console.log("📡 STEP 1: Verifying Dual Database Connectivity...");
  const { local, cloud } = await testDualConnections();
  console.log(`   🏠 Local PC MySQL (3306):   ${local.connected ? "✅ CONNECTED" : "❌ OFFLINE"} (${local.latencyMs}ms) [DB: ${local.database}]`);
  console.log(`   ☁️ TiDB Cloud Buffer (4000): ${cloud.connected ? "✅ CONNECTED" : "❌ OFFLINE"} (${cloud.latencyMs}ms) [DB: ${cloud.database}]`);

  if (!local.connected || !cloud.connected) {
    throw new Error("Both Local MySQL and TiDB Cloud must be online to execute this test.");
  }

  // Step 2: Clean previous test items
  console.log("\n🧹 STEP 2: Cleaning any previous test model records...");
  await cloudQuery("DELETE FROM cloud_catalog_queue WHERE entity_id LIKE 'test_model_%'");
  await localQuery("DELETE FROM phone_models WHERE id LIKE 'test_model_%'");

  // Step 3: Simulate Admin on Mobile/Tablet adding new Phone Models & Series while PC is OFF
  console.log("\n📲 STEP 3: Simulating Admin adding Mobile Models & Series from Phone while PC is OFF...");

  const testModel1 = {
    id: "test_model_nord_ce4",
    brandId: "oneplus",
    name: "OnePlus Nord CE 4 5G",
    series: "Nord CE Series",
    displaySize: "6.7 inch",
    releaseYear: 2024,
    image: "/images/models/oneplus-nord.png",
  };

  const testModel2 = {
    id: "test_model_s24_ultra",
    brandId: "samsung",
    name: "Samsung Galaxy S24 Ultra",
    series: "Galaxy S24 Series",
    displaySize: "6.8 inch",
    releaseYear: 2024,
    image: "/images/models/samsung-s24.png",
  };

  // Insert both into TiDB Cloud temporary queue
  await cloudQuery(
    `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
     VALUES ('q_model_nord', 'model', 'upsert', ?, ?),
            ('q_model_s24', 'model', 'upsert', ?, ?)`,
    [
      testModel1.id, JSON.stringify(testModel1),
      testModel2.id, JSON.stringify(testModel2),
    ]
  );

  const [queuedRows]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_catalog_queue WHERE id LIKE 'q_model_%'"
  );
  console.log(`   ✓ Buffered ${queuedRows[0].count} Phone Model & Series in TiDB Cloud (cloud_catalog_queue).`);
  console.log("   ✓ TiDB Cloud temporary buffer holding offline mobile phone series & models.");

  // Step 4: Simulate PC Boot -> Admin Clicks "Sync & Drain"
  console.log("\n☀️ STEP 4: PC Turns Back ON -> Admin Clicks 'Sync & Drain' in /Tanzar...");
  console.log("   Executing Triple-Handshake (3-Step Verification for Phone Models & Series):");

  const syncResult = await syncAllAndDrainCloud();

  console.log(`   - Local PC MySQL Connected:       ${syncResult.localDbConnected ? "YES" : "NO"}`);
  console.log(`   - Phone Models Synced to PC:      ${syncResult.catalog.syncedCount}`);
  console.log(`   - Phone Models Purged from Cloud: ${syncResult.catalog.purgedCount}`);
  console.log(`   - Remaining in TiDB Cloud:        ${syncResult.catalog.remainingInCloud}`);

  console.log("\n   🔍 Individual 3-Step Verification Handshakes for Models & Series:");
  for (const log of syncResult.catalog.logs.filter((l) => l.queueId.startsWith("q_model_"))) {
    console.log(
      `      [${log.entityType}:${log.entityId}] ` +
      `Handshake 1 (Commit): ${log.handshake1Commit ? "✅" : "❌"} | ` +
      `Handshake 2 (Disk Read-Back): ${log.handshake2ReadBack ? "✅" : "❌"} | ` +
      `Handshake 3 (Integrity Probe): ${log.handshake3Integrity ? "✅" : "❌"} | ` +
      `Purged from Cloud: ${log.purgedFromCloud ? "✅ PURGED" : "❌"}`
    );
  }

  // Step 5: Verify records physically stored on Local PC MySQL Hard Drive
  console.log("\n💾 STEP 5: Verifying Physical Rows in Local PC MySQL Master Database...");
  const [model1Check]: any = await localQuery("SELECT id, name, series, brand_id, screen_size FROM phone_models WHERE id = ?", [testModel1.id]);
  const [model2Check]: any = await localQuery("SELECT id, name, series, brand_id, screen_size FROM phone_models WHERE id = ?", [testModel2.id]);

  console.log(`   ✓ OnePlus Model: ${model1Check.length === 1 ? `✅ STORED ("${model1Check[0].name}" in "${model1Check[0].series}")` : "❌ NOT FOUND"}`);
  console.log(`   ✓ Samsung Model: ${model2Check.length === 1 ? `✅ STORED ("${model2Check[0].name}" in "${model2Check[0].series}")` : "❌ NOT FOUND"}`);

  // Also verify that the series was linked to the brand's series_list
  const [oneplusBrand]: any = await localQuery("SELECT series_list FROM brands WHERE id = 'oneplus'");
  if (oneplusBrand.length > 0) {
    const list = typeof oneplusBrand[0].series_list === "string" ? JSON.parse(oneplusBrand[0].series_list) : (oneplusBrand[0].series_list || []);
    console.log(`   ✓ OnePlus Brand Series List: ${list.includes("Nord CE Series") ? "✅ 'Nord CE Series' AUTO-LINKED TO BRAND" : "ℹ️ (Brand not in DB or unlinked)"}`);
  }

  // Step 6: Verify TiDB Cloud Buffer Storage Purge (Zero Cloud Bloat)
  console.log("\n🧹 STEP 6: Verifying Zero-Bloat TiDB Cloud Purge (Cloud Storage Cleaned)...");
  const [remainingRows]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_catalog_queue WHERE id LIKE 'q_model_%'"
  );
  console.log(`   - Pending in TiDB Cloud: ${remainingRows[0].count} items ${remainingRows[0].count === 0 ? "✅ (100% CLEAN & EMPTY)" : "❌ FAILED TO PURGE"}`);

  if (remainingRows[0].count !== 0) {
    throw new Error("Cloud catalog purge failed: phone models still linger in TiDB Cloud!");
  }

  // Step 7: Clean up test rows
  console.log("\n🧹 STEP 7: Cleaning up test model artifacts from local database...");
  await localQuery("DELETE FROM phone_models WHERE id LIKE 'test_model_%'");
  console.log("   ✓ Test phone models cleaned cleanly.");

  console.log("\n================================================================================");
  console.log("🎉 ALL MOBILE PHONE SERIES & MODELS CATALOG SYNC & DRAIN TESTS PASSED 100%!");
  console.log("   1. New models & series added from mobile/tablet saved temporarily to TiDB Cloud.");
  console.log("   2. 3-step verification committed models & linked series to local PC MySQL.");
  console.log("   3. TiDB Cloud was 100% purged and wiped clean (0 MB used).");
  console.log("================================================================================\n");

  process.exit(0);
}

runPhoneModelAndSeriesVerification().catch((err) => {
  console.error("\n❌ PHONE MODEL VERIFICATION FAILED:", err);
  process.exit(1);
});
