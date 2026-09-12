import { NextResponse } from "next/server";
import { query, testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  if (!id && !email) {
    return NextResponse.json(
      { valid: false, exists: false, error: "Missing user identification (id or email)" },
      { status: 400, headers }
    );
  }

  try {
    const dbHealth = await testConnection();

    if (dbHealth.connected) {
      let sql = "SELECT id, name, email, phone, role, provider, created_at FROM users WHERE ";
      const params: any[] = [];

      if (id && email) {
        sql += "(id = ? OR email = ?) LIMIT 1";
        params.push(id, email.toLowerCase().trim());
      } else if (id) {
        sql += "id = ? LIMIT 1";
        params.push(id);
      } else {
        sql += "email = ? LIMIT 1";
        params.push(email!.toLowerCase().trim());
      }

      const [rows]: any = await query(sql, params);

      if (!rows || rows.length === 0) {
        // User account was deleted or no longer exists in MySQL database
        return NextResponse.json(
          {
            valid: false,
            exists: false,
            error: "User account does not exist or has been deleted from the database",
          },
          { status: 401, headers }
        );
      }

      const user = rows[0];
      return NextResponse.json(
        {
          valid: true,
          exists: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            provider: user.provider,
            createdAt: user.created_at,
          },
        },
        { status: 200, headers }
      );
    }

    // Fallback if local database is offline (check cloud_user_queue)
    if (email) {
      const [queueRows]: any = await query(
        "SELECT id, user_payload FROM cloud_user_queue WHERE email = ? LIMIT 1",
        [email.toLowerCase().trim()]
      ).catch(() => [[]]);

      if (queueRows && queueRows.length > 0) {
        return NextResponse.json(
          { valid: true, exists: true, inQueue: true },
          { status: 200, headers }
        );
      }
    }

    // If DB is unreachable and not in queue
    return NextResponse.json(
      { valid: false, exists: false, error: "Database offline and user unverified" },
      { status: 401, headers }
    );
  } catch (err: any) {
    console.error("[Auth Verify Error]:", err);
    return NextResponse.json(
      { valid: false, exists: false, error: err.message || "Internal verification error" },
      { status: 500, headers }
    );
  }
}
