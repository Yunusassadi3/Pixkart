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
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "Yunusassadi3";
  const database = process.env.DB_NAME || "pixkart_db";
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  let connection;
  try {
    console.log(`Connecting to database '${database}'...`);
    connection = await mysql.createConnection({ host, port, user, password, database, ssl });

    console.log("\n🗑️ Deleting all products, variants, orders, order items, queue, addresses, and users...");

    // Disable foreign key checks temporarily to safely truncate or delete all rows
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    const [variantsRes]: any = await connection.query("DELETE FROM product_variants;");
    console.log(`✓ Deleted ${variantsRes.affectedRows} product variants.`);

    const [productsRes]: any = await connection.query("DELETE FROM products;");
    console.log(`✓ Deleted ${productsRes.affectedRows} products.`);

    const [orderItemsRes]: any = await connection.query("DELETE FROM order_items;");
    console.log(`✓ Deleted ${orderItemsRes.affectedRows} order items.`);

    const [ordersRes]: any = await connection.query("DELETE FROM orders;");
    console.log(`✓ Deleted ${ordersRes.affectedRows} orders.`);

    try {
      const [queueRes]: any = await connection.query("DELETE FROM cloud_order_queue;");
      console.log(`✓ Deleted ${queueRes.affectedRows} cloud order queue items.`);
    } catch {}

    const [addressesRes]: any = await connection.query("DELETE FROM addresses;");
    console.log(`✓ Deleted ${addressesRes.affectedRows} user addresses.`);

    const [usersRes]: any = await connection.query("DELETE FROM users;");
    console.log(`✓ Deleted ${usersRes.affectedRows} users.`);

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("\n✅ All products, orders, and users have been successfully deleted! Brands and categories preserved.");
  } catch (err: any) {
    console.error("❌ Error deleting data:", err?.message || err);
  } finally {
    if (connection) await connection.end();
  }
}

main();
