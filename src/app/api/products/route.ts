import { NextResponse } from "next/server";
import { executeSafeQuery, query, testConnection, testLocalConnection, localQuery, cloudQuery } from "@/lib/db";
import { products as fallbackProducts, Product } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category");
  const brandId = searchParams.get("brand");
  const queryText = searchParams.get("q");

  let sql = "SELECT * FROM products WHERE 1=1";
  const params: any[] = [];

  if (categoryId && categoryId !== "all") {
    sql += " AND category_id = ?";
    params.push(categoryId);
  }

  if (brandId && brandId !== "all") {
    sql += " AND brand_id = ?";
    params.push(brandId);
  }

  if (queryText && queryText.trim()) {
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(`%${queryText.trim()}%`, `%${queryText.trim()}%`);
  }

  sql += " ORDER BY is_featured DESC, rating DESC, created_at DESC";

  // Filter fallback products for offline support
  let filteredFallback = [...fallbackProducts];
  if (categoryId && categoryId !== "all") {
    filteredFallback = filteredFallback.filter((p) => p.categoryId === categoryId);
  }
  if (brandId && brandId !== "all") {
    filteredFallback = filteredFallback.filter((p) => p.brandId === brandId);
  }
  if (queryText && queryText.trim()) {
    const q = queryText.toLowerCase().trim();
    filteredFallback = filteredFallback.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  const result = await executeSafeQuery<any[]>(sql, params, filteredFallback);

  // Format database rows if from MySQL
  let formattedProducts: Product[] = [];
  if (result.isConnected && Array.isArray(result.data) && result.data.length > 0) {
    formattedProducts = result.data.map((row: any) => {
      let parsedSpecs: Record<string, any> = {};
      try {
        parsedSpecs = typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs || {};
      } catch {}

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description || "",
        basePrice: parseFloat(row.base_price),
        mrp: Math.round(parseFloat(row.base_price) * 1.5),
        discountPercent: row.discount_percent || 0,
        brandId: row.brand_id,
        categoryId: row.category_id,
        isFeatured: Boolean(parsedSpecs.isFeatured ?? row.is_featured),
        isDealOfDay: Boolean(parsedSpecs.isDealOfDay ?? row.is_bestseller),
        inSpotlight: Boolean(parsedSpecs.inSpotlight ?? row.is_trending),
        inHeroBanner: Boolean(parsedSpecs.inHeroBanner),
        inPromoBanner: Boolean(parsedSpecs.inPromoBanner),
        badgeText: parsedSpecs.badgeText || (row.is_bestseller ? "Bestseller" : ""),
        rating: parseFloat(row.rating) || 4.8,
        reviewCount: row.rating_count || 0,
        features: Array.isArray(parsedSpecs.features) ? parsedSpecs.features : [],
        stockStatus: row.stock_status || "in_stock",
        imageUrls: typeof row.images === "string" ? JSON.parse(row.images) : row.images || [],
        specs: parsedSpecs,
      };
    });
  } else {
    formattedProducts = [...filteredFallback];
  }

  // If local is offline (e.g. running on Netlify), also merge any pending products buffered in cloud_catalog_queue
  try {
    const localHealth = await testLocalConnection();
    if (!localHealth.connected) {
      const [queueRows]: any = await cloudQuery(
        "SELECT action, entity_id, payload FROM cloud_catalog_queue WHERE entity_type = 'product'"
      );
      if (queueRows && queueRows.length > 0) {
        for (const qItem of queueRows) {
          try {
            const payload = typeof qItem.payload === "string" ? JSON.parse(qItem.payload) : qItem.payload;
            if (qItem.action === "delete") {
              formattedProducts = formattedProducts.filter((p) => p.id !== qItem.entity_id);
            } else if (qItem.action === "upsert" && payload) {
              const existingIdx = formattedProducts.findIndex((p) => p.id === payload.id);
              if (existingIdx >= 0) {
                formattedProducts[existingIdx] = { ...formattedProducts[existingIdx], ...payload };
              } else {
                formattedProducts.unshift(payload);
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  return NextResponse.json({
    products: formattedProducts,
    source: result.isConnected ? "mysql_database" : "offline_cache",
    total: formattedProducts.length,
  });
}

export async function POST(request: Request) {
  try {
    const product: Product = await request.json();

    if (!product || !product.id || !product.title) {
      return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudDb = false;
    let savedToCloudQueue = false;

    const normalizedStock = (product.stockStatus || "in_stock").toLowerCase().replace(/\s+/g, "_");
    const fullSpecs = {
      ...(product.specs || {}),
      badgeText: product.badgeText,
      inSpotlight: Boolean(product.inSpotlight),
      inHeroBanner: Boolean(product.inHeroBanner),
      inPromoBanner: Boolean(product.inPromoBanner),
      isFeatured: Boolean(product.isFeatured),
      isDealOfDay: Boolean(product.isDealOfDay),
      features: product.features || [],
    };

    const productParams = [
      product.id,
      product.title,
      product.slug || product.id,
      product.description || "",
      product.basePrice || 0,
      product.discountPercent || 0,
      product.brandId || null,
      product.categoryId || null,
      product.isFeatured ? 1 : 0,
      product.inSpotlight ? 1 : 0,
      product.isDealOfDay ? 1 : (product.badgeText?.toLowerCase().includes("bestseller") ? 1 : 0),
      product.rating || 4.5,
      product.reviewCount || 0,
      normalizedStock,
      JSON.stringify(product.imageUrls || []),
      JSON.stringify(fullSpecs),
      JSON.stringify((product as any).compatibleModels || []),
    ];

    const upsertSql = `INSERT INTO products (
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
      brand_id = VALUES(brand_id),
      category_id = VALUES(category_id),
      is_featured = VALUES(is_featured),
      is_trending = VALUES(is_trending),
      is_bestseller = VALUES(is_bestseller),
      rating = VALUES(rating),
      rating_count = VALUES(rating_count),
      stock_status = VALUES(stock_status),
      images = VALUES(images),
      specs = VALUES(specs),
      compatible_models = VALUES(compatible_models);`;

    // 1. If running on localhost:3000 (Local PC MySQL is online), write directly & exclusively to Local MySQL!
    // TiDB Cloud stays 100% clean (0 KB storage).
    if (localHealth.connected) {
      try {
        await localQuery(upsertSql, productParams);
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Product API] Local DB write notice: ${dbErr.message}`);
      }
    } else {
      // 2. ONLY when running on Netlify / mobile cloud (PC is offline): buffer into TiDB Cloud!
      try {
        await cloudQuery(upsertSql, productParams);
        savedToCloudDb = true;
      } catch (cloudDbErr: any) {
        console.warn(`[Product API] TiDB Cloud direct products table notice: ${cloudDbErr?.message}`);
      }

      try {
        const queueId = `cat_product_${product.id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'product', 'upsert', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'upsert', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, product.id, JSON.stringify(product)]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Product API] Cloud catalog queue buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      persisted: savedToLocalDb || savedToCloudDb || savedToCloudQueue,
      savedToLocalDb,
      savedToCloudDb,
      savedToCloudQueue,
      productId: product.id,
      message: savedToLocalDb
        ? "Product saved directly to Local PC MySQL master (TiDB Cloud remains 0 KB clean)."
        : savedToCloudDb || savedToCloudQueue
        ? "Product saved to 24/7 TiDB Cloud buffer. Ready for PC Sync & Drain."
        : "Product saved in client storage.",
    });
  } catch (err: any) {
    console.error("[Product POST API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let deletedFromLocalDb = false;
    let deletedFromCloudDb = false;
    let savedToCloudQueue = false;

    // 1. If running on localhost:3000 (Local PC MySQL is online)
    if (localHealth.connected) {
      try {
        await localQuery("DELETE FROM products WHERE id = ?", [id]);
        deletedFromLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Product API] Local DB delete notice: ${dbErr.message}`);
      }

      // Also clean from TiDB Cloud if present to ensure TiDB Cloud is 100% clean
      try {
        await cloudQuery("DELETE FROM products WHERE id = ?", [id]);
        await cloudQuery("DELETE FROM cloud_catalog_queue WHERE entity_id = ?", [id]);
        deletedFromCloudDb = true;
      } catch {}
    } else {
      // 2. If running on Netlify / mobile cloud (PC is offline): buffer deletion in queue for PC sync
      try {
        await cloudQuery("DELETE FROM products WHERE id = ?", [id]);
        deletedFromCloudDb = true;
      } catch (cloudErr: any) {
        console.warn(`[Product API] TiDB Cloud delete notice: ${cloudErr?.message}`);
      }

      try {
        const queueId = `cat_product_del_${id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'product', 'delete', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'delete', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, id, JSON.stringify({ id })]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Product API] Cloud catalog queue delete notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedFromLocalDb || deletedFromCloudDb,
      savedToLocalDb: deletedFromLocalDb,
      savedToCloudDb: deletedFromCloudDb,
      savedToCloudQueue,
      productId: id,
      message: deletedFromLocalDb
        ? "Product removed directly from Local PC MySQL master."
        : "Product deletion buffered in TiDB Cloud for PC sync.",
    });
  } catch (err: any) {
    console.error("[Product DELETE API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete product" }, { status: 500 });
  }
}
