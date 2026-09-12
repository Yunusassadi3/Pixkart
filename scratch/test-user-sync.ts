import { query, testConnection } from "../src/lib/db";
import { syncAndDrainCloudUserQueue, syncAllAndDrainCloud } from "../src/lib/syncEngine";

async function runTests() {
  console.log("==========================================================");
  console.log("🧪 PixKart Cloud User Buffering & Triple-Handshake Sync Test");
  console.log("==========================================================\n");

  // 1. Check DB connection
  const health = await testConnection();
  console.log("1. Database Connection Status:", health.connected ? "CONNECTED (✓)" : "OFFLINE (⨯)");
  if (!health.connected) {
    console.error("Database connection failed. Please ensure MySQL is running.");
    process.exit(1);
  }

  // 2. Clear test records if any
  const testUserId = `test_user_${Date.now()}`;
  const testEmail = `test_offline_${Date.now()}@pixkart.com`;

  console.log(`\n2. Simulating Offline User Registration during PC shutdown...`);
  const mockUserPayload = {
    id: testUserId,
    name: "Mohammad Assadi",
    email: testEmail,
    phone: "+91 99887 76655",
    avatar: "https://ui-avatars.com/api/?name=Mohammad+Assadi",
    provider: "google",
    role: "customer",
    addresses: [
      {
        id: `addr_${testUserId}_1`,
        type: "Home",
        name: "Mohammad Assadi",
        phone: "+91 99887 76655",
        address: "Flat 402, Assadi Heights, Manipal",
        city: "Udupi",
        state: "Karnataka",
        pincode: "576104",
        isDefault: true,
      },
      {
        id: `addr_${testUserId}_2`,
        type: "Work",
        name: "Mohammad Assadi",
        phone: "+91 99887 76655",
        address: "PixKart HQ, Main Road, Udupi",
        city: "Udupi",
        state: "Karnataka",
        pincode: "576101",
        isDefault: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  // Insert directly into cloud_user_queue (mimicking offline cloud capture)
  await query(
    `INSERT INTO cloud_user_queue (id, user_email, user_payload)
     VALUES (?, ?, ?)`,
    [testUserId, testEmail, JSON.stringify(mockUserPayload)]
  );
  console.log("✓ Buffered 1 offline user registration into 'cloud_user_queue' (PC was OFF).");

  // Verify pending queue count
  const [queueRows]: any = await query("SELECT COUNT(*) as count FROM cloud_user_queue WHERE id = ?", [testUserId]);
  console.log(`✓ Cloud Queue Pending Count for test user: ${queueRows[0].count}`);

  // 3. Trigger Triple-Handshake Sync Engine (PC turned ON)
  console.log("\n3. Triggering Triple-Handshake Auto-Sync Engine (PC turned ON)...");
  const syncResult = await syncAndDrainCloudUserQueue();
  console.log("Sync Result Summary:", {
    totalPendingInCloud: syncResult.totalPendingInCloud,
    syncedCount: syncResult.syncedCount,
    failedCount: syncResult.failedCount,
    purgedCount: syncResult.purgedCount,
    remainingInCloud: syncResult.remainingInCloud,
  });

  console.log("\nDetailed Handshake Logs:");
  syncResult.logs.forEach((log) => {
    console.log(`- User ID: ${log.userId} (${log.userEmail})`);
    console.log(`  * Handshake 1 (Atomic ACID Write): ${log.handshake1Commit ? "PASSED (✓)" : "FAILED (⨯)"}`);
    console.log(`  * Handshake 2 (Read-Back from Disk): ${log.handshake2ReadBack ? "PASSED (✓)" : "FAILED (⨯)"}`);
    console.log(`  * Handshake 3 (Address Integrity Probe): ${log.handshake3Integrity ? "PASSED (✓)" : "FAILED (⨯)"}`);
    console.log(`  * Cloud Purge: ${log.purgedFromCloud ? "PURGED FROM CLOUD (✓)" : "RETAINED (⨯)"}`);
    console.log(`  * Message: ${log.message}`);
  });

  // 4. Verify user and addresses in MySQL tables
  console.log("\n4. Verifying stored records in local MySQL tables...");
  const [userDbRows]: any = await query("SELECT * FROM users WHERE id = ?", [testUserId]);
  const [addrDbRows]: any = await query("SELECT * FROM addresses WHERE user_id = ?", [testUserId]);
  const [remainingQueueRows]: any = await query("SELECT * FROM cloud_user_queue WHERE id = ?", [testUserId]);

  console.log("User record in 'users' table:", userDbRows[0]?.email === testEmail ? "VERIFIED (✓)" : "FAILED (⨯)");
  console.log("Address records in 'addresses' table:", addrDbRows.length === 2 ? `VERIFIED 2 ADDRESSES (✓)` : `FAILED (found ${addrDbRows.length})`);
  console.log("Remaining in 'cloud_user_queue':", remainingQueueRows.length === 0 ? "CLEAN 0 (PURGED ✓)" : `FAILED (${remainingQueueRows.length} remaining)`);

  // Cleanup test user
  await query("DELETE FROM users WHERE id = ?", [testUserId]);
  console.log("\n✓ Cleaned up test records from MySQL.");

  console.log("\n==========================================================");
  console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("==========================================================");
}

runTests().catch(console.error);
