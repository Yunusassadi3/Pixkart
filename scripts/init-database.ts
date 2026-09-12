import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { brands } from "../src/lib/data/brands";
import { categories } from "../src/lib/data/categories";
import { phoneModels } from "../src/lib/data/models";
import { products } from "../src/lib/data/products";
import { UDUPI_PINCODES } from "../src/context/AppContext";

// Load .env.local if present
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
  console.log("=========================================================");
  console.log("🚀 PixKart Database Initialization & Auto-Seed Engine");
  console.log("100% Free MySQL 8.0 CE & 24/7 Cloud Architecture");
  console.log("=========================================================\n");

  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || process.env.DB_USERNAME || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || process.env.DB_DATABASE || "test";
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  console.log(`📡 Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // 1. Initial connection without database to ensure database exists
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl,
    });
    console.log("✓ Connected to MySQL server successfully.");

    console.log(`📦 Ensuring database '${database}' exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.changeUser({ database });
    console.log(`✓ Using database '${database}'.`);

    // 2. Read and execute init-db.sql
    const sqlPath = path.join(__dirname, "init-db.sql");
    const sqlScript = fs.readFileSync(sqlPath, "utf8");
    
    // Split SQL by semicolons
    const statements = sqlScript
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.toLowerCase().startsWith("create database") && !s.toLowerCase().startsWith("use "));

    console.log(`⚙️ Executing ${statements.length} table definitions...`);
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log("✓ All 13 tables created / verified successfully.");

    // 3. Seed Brands
    console.log(`🏷️ Seeding ${brands.length} phone brands...`);
    for (const b of brands) {
      await connection.query(
        `INSERT INTO brands (id, name, logo, series_list)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), logo = VALUES(logo), series_list = VALUES(series_list);`,
        [b.id, b.name, b.logo || null, JSON.stringify((b as any).series || [])]
      );
    }

    // 4. Seed Categories
    console.log(`📂 Seeding ${categories.length} product categories...`);
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      await connection.query(
        `INSERT INTO categories (id, name, slug, icon, image, display_order)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug), icon = VALUES(icon), image = VALUES(image), display_order = VALUES(display_order);`,
        [c.id, c.name, c.slug, c.icon || null, c.image || null, i + 1]
      );
    }

    // 5. Seed Phone Models
    console.log(`📱 Seeding ${phoneModels.length} phone models...`);
    for (const m of phoneModels) {
      await connection.query(
        `INSERT INTO phone_models (id, brand_id, name, series, screen_size, image)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), series = VALUES(series), screen_size = VALUES(screen_size), image = VALUES(image);`,
        [m.id, m.brandId, m.name, m.series || null, m.displaySize || null, (m as any).image || null]
      );
    }

    // 6. Seed Products (Clean catalog - products are populated exclusively via Admin Portal)
    console.log(`🛍️ Catalog initialized clean (${products.length} products). Ready for Admin Portal input.`);
    // Ensure stock_status column is VARCHAR(32)
    try {
      await connection.query("ALTER TABLE products MODIFY COLUMN stock_status VARCHAR(32) DEFAULT 'in_stock';");
    } catch {}

    for (const p of products) {
      const normalizedStock = (p.stockStatus || "in_stock").toLowerCase().replace(/\s+/g, "_");
      await connection.query(
        `INSERT INTO products (
          id, title, slug, description, base_price, discount_percent,
          brand_id, category_id, is_featured, is_trending, is_bestseller,
          rating, rating_count, stock_status, images, specs, compatible_models
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          slug = VALUES(slug),
          description = VALUES(description),
          base_price = VALUES(base_price),
          discount_percent = VALUES(discount_percent),
          rating = VALUES(rating),
          rating_count = VALUES(rating_count),
          stock_status = VALUES(stock_status),
          images = VALUES(images),
          specs = VALUES(specs),
          compatible_models = VALUES(compatible_models);`,
        [
          p.id,
          p.title,
          p.slug,
          p.description || "",
          p.basePrice,
          p.discountPercent || 0,
          p.brandId || null,
          p.categoryId || null,
          p.isFeatured ? 1 : 0,
          (p as any).isTrending ? 1 : 0,
          p.badgeText?.toLowerCase().includes("bestseller") ? 1 : 0,
          p.rating || 4.5,
          p.reviewCount || 0,
          normalizedStock,
          JSON.stringify(p.imageUrls || []),
          JSON.stringify(p.specs || {}),
          JSON.stringify((p as any).compatibleModels || []),
        ]
      );
    }

    // 7. Seed Serviceable Pincodes
    console.log(`📍 Seeding serviceable pincodes...`);
    for (const [pin, locality] of Object.entries(UDUPI_PINCODES)) {
      await connection.query(
        `INSERT INTO serviceable_pincodes (pincode, locality, city, state, is_active, delivery_hours)
         VALUES (?, ?, 'Udupi', 'Karnataka', 1, 48)
         ON DUPLICATE KEY UPDATE locality = VALUES(locality);`,
        [pin, locality]
      );
    }

    // 8. Seed Default Admin Settings
    await connection.query(
      `INSERT INTO admin_settings (setting_key, setting_value)
       VALUES ('store_name', 'PixKart Mobile Accessories'),
              ('store_email', 'pixkartofficial@gmail.com'),
              ('free_shipping_threshold', '499'),
              ('support_phone', '+91 99000 00000')
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);`
    );

    console.log("\n=========================================================");
    console.log("✅ DATABASE INITIALIZATION & SEED COMPLETED SUCCESSFULLY!");
    console.log(`Database: ${database}`);
    console.log(`Products Seeded: ${products.length}`);
    console.log(`Phone Models Seeded: ${phoneModels.length}`);
    console.log(`Brands Seeded: ${brands.length}`);
    console.log(`Categories Seeded: ${categories.length}`);
    console.log("=========================================================\n");
  } catch (err: any) {
    console.error("\n❌ Database initialization error:", err?.message || err);
    console.error("\nTip: Make sure your MySQL 8.0 server is running and your credentials in .env.local are correct.");
  } finally {
    if (connection) await connection.end();
  }
}

main();
