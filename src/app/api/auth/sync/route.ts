import { NextResponse } from "next/server";
import { query, testLocalConnection, testConnection, executeLocalTransaction, cloudQuery } from "@/lib/db";
import { UserProfile } from "@/context/AppContext";
import { UserPayload } from "@/lib/syncEngine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user: UserProfile | UserPayload = await request.json();

    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    const cleanEmail = user.email.toLowerCase().trim();
    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudQueue = false;

    // Case 1: Local MySQL is connected (PC is ON)
    if (localHealth.connected) {
      try {
        await executeLocalTransaction(async (conn) => {
          // Upsert into master users table
          await conn.query(
            `INSERT INTO users (id, name, email, phone, avatar, provider, role, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               name = VALUES(name),
               avatar = VALUES(avatar),
               phone = VALUES(phone),
               provider = VALUES(provider);`,
            [
              user.id,
              user.name || "Customer",
              cleanEmail,
              user.phone || null,
              user.avatar || null,
              user.provider || "google",
              (user as any).role || "customer",
              user.createdAt ? new Date(user.createdAt) : new Date(),
            ]
          );

          // Upsert user delivery addresses if present
          if (user.addresses && user.addresses.length > 0) {
            for (let i = 0; i < user.addresses.length; i++) {
              const addr = user.addresses[i];
              const addrId = addr.id || `addr_${user.id}_${i + 1}`;
              await conn.query(
                `INSERT INTO addresses (
                  id, user_id, type, name, phone, address, city, state, pincode, is_default
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  type = VALUES(type),
                  name = VALUES(name),
                  phone = VALUES(phone),
                  address = VALUES(address),
                  city = VALUES(city),
                  state = VALUES(state),
                  pincode = VALUES(pincode),
                  is_default = VALUES(is_default);`,
                [
                  addrId,
                  user.id,
                  addr.type || "Home",
                  addr.name || user.name || "Customer",
                  addr.phone || user.phone || "0000000000",
                  addr.address || "Udupi",
                  addr.city || "Udupi",
                  addr.state || "Karnataka",
                  addr.pincode || "576101",
                  addr.isDefault ? 1 : 0,
                ]
              );
            }
          }
        });
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Auth Sync API] Direct DB write failed, buffering to cloud queue: ${dbErr.message}`);
      }
    }

    // Case 2: Local MySQL is offline (PC is turned OFF / Cloud deployment)
    if (!savedToLocalDb) {
      try {
        await cloudQuery(
          `INSERT INTO cloud_user_queue (id, user_email, user_payload)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE user_payload = VALUES(user_payload), created_at = NOW();`,
          [user.id, cleanEmail, JSON.stringify(user)]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Auth Sync API] Cloud user queue buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      persisted: savedToLocalDb,
      savedToLocalDb,
      savedToCloudQueue,
      userId: user.id,
      email: cleanEmail,
      message: savedToLocalDb
        ? "User and addresses synchronized to MySQL."
        : savedToCloudQueue
        ? "User stored in 24/7 Cloud Queue. Will sync on PC restart."
        : "Active in client session cache.",
    });
  } catch (err: any) {
    console.error("[Auth Sync API Error]:", err);
    return NextResponse.json({ error: err?.message || "Auth sync error", persisted: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const dbHealth = await testConnection();
  if (!dbHealth.connected) {
    return NextResponse.json({ users: [], isConnected: false });
  }

  try {
    let sql = "SELECT id, name, email, phone, avatar, provider, role, created_at FROM users";
    const params: any[] = [];
    if (email) {
      sql += " WHERE email = ?";
      params.push(email.toLowerCase().trim());
    }
    sql += " ORDER BY created_at DESC LIMIT 50";

    const [rows]: any = await query(sql, params);
    return NextResponse.json({ users: rows || [], isConnected: true });
  } catch (err: any) {
    return NextResponse.json({ users: [], error: err.message, isConnected: false });
  }
}
