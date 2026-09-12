import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] = val;
    }
  });
}

async function main() {
  const action = process.argv[2]?.toLowerCase();
  const target = process.argv[3];

  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "Yunusassadi3";
  const database = process.env.DB_NAME || "pixkart_db";
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, database, ssl });

    if (!action || action === "list") {
      console.log("\n📋 --- Current Registered Users in pixkart_db ---");
      const [rows] = await connection.query<any[]>(
        "SELECT id, name, email, phone, role, provider, created_at FROM users ORDER BY created_at DESC"
      );
      if (!rows.length) {
        console.log("No user accounts found in the database.");
      } else {
        console.table(rows);
      }
      console.log("\nTo delete a user, run:");
      console.log("  npx tsx scripts/manage-users.ts delete <email-or-id>\n");
      return;
    }

    if (action === "delete") {
      if (!target) {
        console.error("❌ Error: Please specify an email address or user ID to delete.");
        console.log("Usage: npx tsx scripts/manage-users.ts delete user@example.com");
        process.exit(1);
      }

      // Check if user exists
      const [users] = await connection.query<any[]>(
        "SELECT id, name, email FROM users WHERE email = ? OR id = ?",
        [target, target]
      );

      if (!users.length) {
        console.log(`⚠️ No account found matching: "${target}"`);
        return;
      }

      const foundUser = users[0];
      console.log(`🗑️ Deleting user "${foundUser.name}" (${foundUser.email}, ID: ${foundUser.id})...`);

      // Delete from users table (cascades to addresses automatically)
      const [result]: any = await connection.query(
        "DELETE FROM users WHERE id = ? OR email = ?",
        [foundUser.id, foundUser.email]
      );

      console.log(`✅ Successfully deleted ${result.affectedRows} account(s) from 'users' table.`);
    } else {
      console.log("Unknown action. Available commands: list, delete <email-or-id>");
    }
  } catch (err: any) {
    console.error("❌ Database error:", err?.message || err);
  } finally {
    if (connection) await connection.end();
  }
}

main();
