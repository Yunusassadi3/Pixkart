import { query } from "../src/lib/db";

async function main() {
  try {
    await query(
      "ALTER TABLE orders MODIFY COLUMN order_status VARCHAR(64) NOT NULL DEFAULT 'Ordered'"
    );
    console.log("Altered orders.order_status to VARCHAR(64) DEFAULT 'Ordered'");

    const updateResult: any = await query(
      "UPDATE orders SET order_status = 'Ordered'"
    );
    console.log("Updated rows to 'Ordered':", updateResult[0]?.affectedRows || 0);

    const [rows]: any = await query("SELECT id, order_status FROM orders LIMIT 10");
    console.log("Current order statuses in MySQL:", rows);
    process.exit(0);
  } catch (err: any) {
    console.error("Migration error:", err.message);
    process.exit(1);
  }
}

main();
