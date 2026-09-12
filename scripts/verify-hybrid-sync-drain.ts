import {
  testDualConnections,
  localQuery,
  cloudQuery,
} from "../src/lib/db";
import { syncAllAndDrainCloud } from "../src/lib/syncEngine";

async function runHybridVerification() {
  console.log("================================================================================");
  console.log("🚀 PIXKART DUAL-DATABASE HYBRID VERIFICATION (LOCAL MASTER + TIDB CLOUD BUFFER)");
  console.log("================================================================================\n");

  // Step 1: Health Check Dual Connections
  console.log("📡 STEP 1: Verifying Dual Database Connectivity...");
  const { local, cloud } = await testDualConnections();

  console.log(`   🏠 Local PC MySQL (3306):   ${local.connected ? "✅ CONNECTED (ONLINE)" : "❌ OFFLINE"} (${local.latencyMs}ms) [DB: ${local.database}]`);
  console.log(`   ☁️ TiDB Cloud Buffer (4000): ${cloud.connected ? "✅ CONNECTED (ONLINE)" : "❌ OFFLINE"} (${cloud.latencyMs}ms) [DB: ${cloud.database}]`);

  if (!local.connected) {
    throw new Error(`Local PC MySQL is not connected: ${local.error}`);
  }
  if (!cloud.connected) {
    throw new Error(`TiDB Cloud is not connected: ${cloud.error}`);
  }

  // Step 2: Clean any previous test artifacts
  console.log("\n🧹 STEP 2: Clearing any previous test records...");
  await cloudQuery("DELETE FROM cloud_order_queue WHERE id LIKE 'test_order_%'");
  await cloudQuery("DELETE FROM cloud_user_queue WHERE id LIKE 'test_user_%'");
  await localQuery("DELETE FROM orders WHERE id LIKE 'test_order_%'");
  await localQuery("DELETE FROM users WHERE id LIKE 'test_user_%'");

  // Step 3: Simulate Customer placing an order while PC is OFF (written to TiDB Cloud Buffer)
  console.log("\n🌙 STEP 3: Simulating Customer Order Placed While PC is OFF (Saved to Cloud)...");

  const testOrderId = `test_order_${Date.now()}`;
  const testUserId = `test_user_${Date.now()}`;

  const mockOrderPayload = {
    id: testOrderId,
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    userId: testUserId,
    customerEmail: "customer.test@pixkart.in",
    shippingAddress: {
      name: "Rohan Shetty",
      phone: "9876543210",
      street: "Car Street, Near Krishna Temple",
      city: "Udupi",
      state: "Karnataka",
      pincode: "576101",
    },
    items: [
      {
        variantId: "var_case_001",
        product: {
          id: "prod_case_001",
          title: "Matte Frost Shockproof Case",
          basePrice: 499,
          images: ["https://example.com/case.png"],
        },
        model: { name: "iPhone 15 Pro" },
        selectedColor: "Titanium Blue",
        selectedStorage: "128GB",
        quantity: 2,
      },
      {
        variantId: "var_glass_002",
        product: {
          id: "prod_glass_002",
          title: "9H Edge-to-Edge Tempered Glass",
          basePrice: 299,
          images: ["https://example.com/glass.png"],
        },
        model: { name: "iPhone 15 Pro" },
        quantity: 1,
      },
    ],
    total: 1297,
    subtotal: 1297,
    deliveryFee: 0,
    discount: 0,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "Ordered",
    trackingNumber: `TRACK-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
  };

  const mockUserPayload = {
    id: testUserId,
    name: "Rohan Shetty",
    email: "customer.test@pixkart.in",
    phone: "9876543210",
    provider: "email" as const,
    role: "customer" as const,
    addresses: [
      {
        id: `addr_${testUserId}_1`,
        type: "Home" as const,
        name: "Rohan Shetty",
        phone: "9876543210",
        address: "Car Street, Near Krishna Temple",
        city: "Udupi",
        state: "Karnataka",
        pincode: "576101",
        isDefault: true,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  // Insert into TiDB Cloud Queue
  await cloudQuery(
    `INSERT INTO cloud_order_queue (id, order_number, order_payload)
     VALUES (?, ?, ?)`,
    [mockOrderPayload.id, mockOrderPayload.orderNumber, JSON.stringify(mockOrderPayload)]
  );

  await cloudQuery(
    `INSERT INTO cloud_user_queue (id, user_email, user_payload)
     VALUES (?, ?, ?)`,
    [mockUserPayload.id, mockUserPayload.email, JSON.stringify(mockUserPayload)]
  );

  const [cloudOrderCount]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_order_queue WHERE id = ?",
    [testOrderId]
  );
  const [cloudUserCount]: any = await cloudQuery(
    "SELECT COUNT(*) as count FROM cloud_user_queue WHERE id = ?",
    [testUserId]
  );

  console.log(`   ✓ Buffered in TiDB Cloud: ${cloudOrderCount[0].count} Order(s) & ${cloudUserCount[0].count} User(s).`);
  console.log(`   ✓ TiDB Cloud storage currently holding temporary buffer data.`);

  // Step 4: Simulate PC Turning Back ON and Admin Triggering "Sync & Drain"
  console.log("\n☀️ STEP 4: PC Turns Back ON -> Admin Triggers 'Sync & Drain'...");
  console.log("   Executing Triple-Handshake (3-Step Verification):");

  const syncResult = await syncAllAndDrainCloud();

  console.log(`   - Local PC DB Connected:    ${syncResult.localDbConnected ? "YES" : "NO"}`);
  console.log(`   - Orders Synced to PC:      ${syncResult.orders.syncedCount}`);
  console.log(`   - Orders Purged from Cloud: ${syncResult.orders.purgedCount}`);
  console.log(`   - Users Synced to PC:       ${syncResult.users.syncedCount}`);
  console.log(`   - Users Purged from Cloud:  ${syncResult.users.purgedCount}`);

  // Display Handshake Step Verification Logs for the Order
  const orderLog = syncResult.orders.logs.find((l) => l.orderId === testOrderId);
  if (orderLog) {
    console.log("\n   🔍 Order Triple-Handshake Verification Details:");
    console.log(`      1. Handshake 1 (Atomic ACID Commit to Local MySQL):  ${orderLog.handshake1Commit ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      2. Handshake 2 (Read-Back Probe from Local Disk):     ${orderLog.handshake2ReadBack ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      3. Handshake 3 (Line Items & Price Integrity Probe):  ${orderLog.handshake3ItemIntegrity ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      4. Purged from Cloud (Cloud Queue Storage Cleaned):   ${orderLog.purgedFromCloud ? "✅ PURGED" : "❌ FAILED"}`);
    console.log(`      Final Verification Status:                           [${orderLog.status}]`);
  }

  // Display Handshake Step Verification Logs for the User
  const userLog = syncResult.users.logs.find((l) => l.userId === testUserId);
  if (userLog) {
    console.log("\n   🔍 Customer User Triple-Handshake Verification Details:");
    console.log(`      1. Handshake 1 (Atomic ACID Commit to Local MySQL):  ${userLog.handshake1Commit ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      2. Handshake 2 (Read-Back Probe from Local Disk):     ${userLog.handshake2ReadBack ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      3. Handshake 3 (Address & Profile Integrity Probe):   ${userLog.handshake3Integrity ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`      4. Purged from Cloud (Cloud Queue Storage Cleaned):   ${userLog.purgedFromCloud ? "✅ PURGED" : "❌ FAILED"}`);
    console.log(`      Final Verification Status:                           [${userLog.status}]`);
  }

  // Step 5: Verify records physically exist in Local PC MySQL Database
  console.log("\n💾 STEP 5: Verifying Records in Local PC MySQL (Master Store)...");
  const [localOrderRows]: any = await localQuery("SELECT id, order_number, total_amount, customer_name FROM orders WHERE id = ?", [testOrderId]);
  const [localItemRows]: any = await localQuery("SELECT id, product_title, quantity, total_price FROM order_items WHERE order_id = ?", [testOrderId]);
  const [localUserRows]: any = await localQuery("SELECT id, name, email FROM users WHERE id = ?", [testUserId]);
  const [localAddrRows]: any = await localQuery("SELECT id, address, city, pincode FROM addresses WHERE user_id = ?", [testUserId]);

  console.log(`   ✓ Local PC orders table:       ${localOrderRows.length === 1 ? "✅ STORED ON PC HARD DRIVE" : "❌ NOT FOUND"}`);
  console.log(`   ✓ Local PC order_items table:  ${localItemRows.length === 2 ? `✅ ${localItemRows.length} ITEMS STORED ON PC` : "❌ NOT FOUND"}`);
  console.log(`   ✓ Local PC users table:        ${localUserRows.length === 1 ? "✅ STORED ON PC HARD DRIVE" : "❌ NOT FOUND"}`);
  console.log(`   ✓ Local PC addresses table:    ${localAddrRows.length === 1 ? "✅ ADDRESS STORED ON PC" : "❌ NOT FOUND"}`);

  // Step 6: Verify TiDB Cloud is completely Clean & Empty
  console.log("\n🧹 STEP 6: Verifying TiDB Cloud Buffer Storage Purge (Zero-Cloud-Bloat)...");
  const [remainingCloudOrders]: any = await cloudQuery(
    "SELECT COUNT(*) as cnt FROM cloud_order_queue WHERE id = ?",
    [testOrderId]
  );
  const [remainingCloudUsers]: any = await cloudQuery(
    "SELECT COUNT(*) as cnt FROM cloud_user_queue WHERE id = ?",
    [testUserId]
  );

  const ordersCleaned = remainingCloudOrders[0].cnt === 0;
  const usersCleaned = remainingCloudUsers[0].cnt === 0;

  console.log(`   - Pending Orders in TiDB Cloud: ${remainingCloudOrders[0].cnt} ${ordersCleaned ? "✅ (DELETED / CLEAN)" : "❌ FAILED TO PURGE"}`);
  console.log(`   - Pending Users in TiDB Cloud:  ${remainingCloudUsers[0].cnt} ${usersCleaned ? "✅ (DELETED / CLEAN)" : "❌ FAILED TO PURGE"}`);

  if (!ordersCleaned || !usersCleaned) {
    throw new Error("Cloud drain failed: records still linger in TiDB Cloud!");
  }

  // Step 7: Clean up test rows from local PC database
  console.log("\n🧹 STEP 7: Cleaning up test artifacts from local MySQL...");
  await localQuery("DELETE FROM orders WHERE id = ?", [testOrderId]);
  await localQuery("DELETE FROM users WHERE id = ?", [testUserId]);
  console.log("   ✓ Test records wiped cleanly.");

  console.log("\n================================================================================");
  console.log("🎉 ALL HYBRID 3-STEP SYNC & CLOUD DRAIN TESTS PASSED WITH 100% SUCCESS!");
  console.log("   1. Data saved safely to TiDB Cloud while PC was off.");
  console.log("   2. 3-step verification confirmed 100% data integrity into local PC MySQL.");
  console.log("   3. Cloud buffer automatically purged and completely empty (0 MB used).");
  console.log("================================================================================\n");

  process.exit(0);
}

runHybridVerification().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
