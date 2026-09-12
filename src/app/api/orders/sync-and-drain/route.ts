import { NextResponse } from "next/server";
import { syncAllAndDrainCloud } from "@/lib/syncEngine";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncAllAndDrainCloud();
    return NextResponse.json({
      success: true,
      timestamp: result.timestamp,
      localDbConnected: result.localDbConnected,
      totalPending: result.totalPending,
      totalSynced: result.totalSynced,
      // Catalog breakdown
      catalogSyncedCount: result.catalog.syncedCount,
      catalogFailedCount: result.catalog.failedCount,
      catalogPurgedCount: result.catalog.purgedCount,
      catalogRemainingInCloud: result.catalog.remainingInCloud,
      catalogLogs: result.catalog.logs,
      // Orders breakdown
      ordersSyncedCount: result.orders.syncedCount,
      ordersFailedCount: result.orders.failedCount,
      ordersPurgedCount: result.orders.purgedCount,
      ordersRemainingInCloud: result.orders.remainingInCloud,
      ordersLogs: result.orders.logs,
      // Users breakdown
      usersSyncedCount: result.users.syncedCount,
      usersFailedCount: result.users.failedCount,
      usersPurgedCount: result.users.purgedCount,
      usersRemainingInCloud: result.users.remainingInCloud,
      usersLogs: result.users.logs,
      // Backwards-compatible aliases & totals
      syncedCount: result.catalog.syncedCount + result.orders.syncedCount + result.users.syncedCount,
      failedCount: result.catalog.failedCount + result.orders.failedCount + result.users.failedCount,
      purgedCount: result.catalog.purgedCount + result.orders.purgedCount + result.users.purgedCount,
      remainingInCloud: result.catalog.remainingInCloud + result.orders.remainingInCloud + result.users.remainingInCloud,
      logs: [...result.catalog.logs, ...result.orders.logs, ...result.users.logs],
      catalog: result.catalog,
      orders: result.orders,
      users: result.users,
    });
  } catch (err: any) {
    console.error("[SyncAndDrain API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Sync execution failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
