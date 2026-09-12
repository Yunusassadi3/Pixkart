import { NextResponse } from "next/server";
import { testLocalConnection, testConnection, localQuery, cloudQuery, executeLocalTransaction } from "@/lib/db";
import { CatalogEntityType } from "@/lib/syncEngine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id: customId,
      entityType,
      action = "upsert",
      entityId,
      payload,
    } = body;

    if (!entityType || !entityId || (action === "upsert" && !payload)) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, entityId, and payload (for upsert)" },
        { status: 400 }
      );
    }

    const validTypes: CatalogEntityType[] = [
      "product",
      "brand",
      "category",
      "model",
      "spotlight",
      "hero_slide",
      "promo_ad",
    ];
    if (!validTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType '${entityType}'. Allowed: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const queueId = customId || `cat_${entityType}_${entityId}_${Date.now()}`;
    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudQueue = false;

    // 1. Direct Commit if Local MySQL 8.0 is Connected (PC is ON)
    if (localHealth.connected) {
      try {
        await executeLocalTransaction(async (conn) => {
          if (entityType === "product") {
            if (action === "upsert") {
              const prod = payload;
              const normalizedStock = (prod.stockStatus || prod.stock_status || "in_stock")
                .toLowerCase()
                .replace(/\s+/g, "_");
              const fullSpecs = {
                ...(prod.specs || {}),
                badgeText: prod.badgeText,
                inSpotlight: Boolean(prod.inSpotlight),
                inHeroBanner: Boolean(prod.inHeroBanner),
                inPromoBanner: Boolean(prod.inPromoBanner),
                isFeatured: Boolean(prod.isFeatured),
                isDealOfDay: Boolean(prod.isDealOfDay),
                features: prod.features || [],
              };

              await conn.query(
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
                  compatible_models = VALUES(compatible_models);`,
                [
                  prod.id || entityId,
                  prod.title || "Product",
                  prod.slug || prod.id || entityId,
                  prod.description || "",
                  Number(prod.basePrice ?? prod.base_price) || 0,
                  Number(prod.discountPercent ?? prod.discount_percent) || 0,
                  prod.brandId || prod.brand_id || null,
                  prod.categoryId || prod.category_id || null,
                  prod.isFeatured ? 1 : 0,
                  prod.inSpotlight ? 1 : 0,
                  prod.isDealOfDay ? 1 : (prod.badgeText?.toLowerCase().includes("bestseller") ? 1 : 0),
                  Number(prod.rating) || 4.5,
                  Number(prod.reviewCount ?? prod.rating_count) || 0,
                  normalizedStock,
                  JSON.stringify(prod.imageUrls || prod.images || []),
                  JSON.stringify(fullSpecs),
                  JSON.stringify(prod.compatibleModels || prod.compatible_models || []),
                ]
              );
            } else if (action === "delete") {
              await conn.query("DELETE FROM products WHERE id = ?", [entityId]);
            }
          } else if (entityType === "brand") {
            if (action === "upsert") {
              const b = payload;
              await conn.query(
                `INSERT INTO brands (id, name, logo, series_list)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name = VALUES(name),
                   logo = VALUES(logo),
                   series_list = VALUES(series_list);`,
                [
                  b.id || entityId,
                  b.name || "Brand",
                  b.logo || null,
                  JSON.stringify(b.series || b.series_list || []),
                ]
              );
            } else if (action === "delete") {
              await conn.query("DELETE FROM brands WHERE id = ?", [entityId]);
            }
          } else if (entityType === "category") {
            if (action === "upsert") {
              const c = payload;
              await conn.query(
                `INSERT INTO categories (id, name, slug, icon, image, display_order)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   name = VALUES(name),
                   slug = VALUES(slug),
                   icon = VALUES(icon),
                   image = VALUES(image),
                   display_order = VALUES(display_order);`,
                [
                  c.id || entityId,
                  c.name || "Category",
                  c.slug || c.id || entityId,
                  c.icon || null,
                  c.image || null,
                  Number(c.displayOrder ?? c.display_order) || 0,
                ]
              );
            } else if (action === "delete") {
              await conn.query("DELETE FROM categories WHERE id = ?", [entityId]);
            }
          } else if (entityType === "model") {
            if (action === "upsert") {
              const m = payload;
              const brandId = m.brandId || m.brand_id || null;
              await conn.query(
                `INSERT INTO phone_models (id, brand_id, name, series, screen_size, image)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   brand_id = VALUES(brand_id),
                   name = VALUES(name),
                   series = VALUES(series),
                   screen_size = VALUES(screen_size),
                   image = VALUES(image);`,
                [
                  m.id || entityId,
                  brandId,
                  m.name || "Model",
                  m.series || null,
                  m.displaySize || m.screen_size || null,
                  m.image || null,
                ]
              );

              // Link series to brand's series_list
              if (brandId && m.series) {
                const [bRows]: any = await conn.query(
                  "SELECT series_list FROM brands WHERE id = ?",
                  [brandId]
                );
                if (bRows && bRows.length > 0) {
                  let currentSeries: string[] = [];
                  try {
                    currentSeries =
                      typeof bRows[0].series_list === "string"
                        ? JSON.parse(bRows[0].series_list)
                        : (bRows[0].series_list || []);
                    if (!Array.isArray(currentSeries)) currentSeries = [];
                  } catch {
                    currentSeries = [];
                  }
                  if (!currentSeries.includes(m.series.trim())) {
                    currentSeries.push(m.series.trim());
                    await conn.query(
                      "UPDATE brands SET series_list = ? WHERE id = ?",
                      [JSON.stringify(currentSeries), brandId]
                    );
                  }
                }
              }
            } else if (action === "delete") {
              await conn.query("DELETE FROM phone_models WHERE id = ?", [entityId]);
            }
          } else if (
            entityType === "spotlight" ||
            entityType === "hero_slide" ||
            entityType === "promo_ad"
          ) {
            const settingKeyMap: Record<string, string> = {
              spotlight: "spotlight_brands",
              hero_slide: "hero_slides",
              promo_ad: "promo_ads",
            };
            const settingKey = settingKeyMap[entityType];

            const [existingRows]: any = await conn.query(
              "SELECT setting_value FROM admin_settings WHERE setting_key = ?",
              [settingKey]
            );

            let currentList: any[] = [];
            if (existingRows && existingRows.length > 0) {
              try {
                currentList = JSON.parse(existingRows[0].setting_value);
                if (!Array.isArray(currentList)) currentList = [];
              } catch {
                currentList = [];
              }
            }

            let updatedList: any[];
            if (action === "upsert") {
              const existingIdx = currentList.findIndex((item: any) => item.id === entityId);
              if (existingIdx >= 0) {
                updatedList = currentList.map((item: any) =>
                  item.id === entityId ? payload : item
                );
              } else {
                updatedList = [payload, ...currentList];
              }
            } else {
              updatedList = currentList.filter((item: any) => item.id !== entityId);
            }

            await conn.query(
              `INSERT INTO admin_settings (setting_key, setting_value)
               VALUES (?, ?)
               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);`,
              [settingKey, JSON.stringify(updatedList)]
            );
          }
        });
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Admin CloudSync] Direct DB write failed, buffering to cloud queue: ${dbErr.message}`);
      }
    }

    // 2. Buffer in Cloud Catalog Queue if Local MySQL is Offline (PC is OFF)
    if (!savedToLocalDb) {
      try {
        if (entityType === "model") {
          if (action === "upsert") {
            const m = payload;
            await cloudQuery(
              `INSERT INTO phone_models (id, brand_id, name, series, screen_size, image)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
                 brand_id = VALUES(brand_id),
                 name = VALUES(name),
                 series = VALUES(series),
                 screen_size = VALUES(screen_size),
                 image = VALUES(image);`,
              [
                m.id || entityId,
                m.brandId || m.brand_id || null,
                m.name || "Model",
                m.series || null,
                m.displaySize || m.screen_size || null,
                m.image || null,
              ]
            ).catch(() => {});
          } else if (action === "delete") {
            await cloudQuery("DELETE FROM phone_models WHERE id = ?", [entityId]).catch(() => {});
          }
        }
      } catch {}

      try {
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             action = VALUES(action),
             payload = VALUES(payload),
             sync_attempts = 0,
             created_at = NOW();`,
          [
            queueId,
            entityType,
            action,
            entityId,
            JSON.stringify(payload || {}),
          ]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Admin CloudSync] Cloud catalog queue buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      savedToLocalDb,
      savedToCloudQueue,
      entityType,
      entityId,
      action,
      message: savedToLocalDb
        ? `${entityType} '${entityId}' saved directly to MySQL master.`
        : savedToCloudQueue
        ? `${entityType} '${entityId}' buffered in 24/7 Cloud Catalog Queue. Will sync on PC restart.`
        : "Active in client state.",
    });
  } catch (err: any) {
    console.error("[Admin CloudSync Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process catalog sync" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [rows]: any = await cloudQuery(
      "SELECT id, entity_type, action, entity_id, payload, sync_attempts, created_at FROM cloud_catalog_queue ORDER BY created_at ASC"
    );

    const formatted = (rows || []).map((row: any) => ({
      ...row,
      payload: typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload,
    }));

    return NextResponse.json({
      pendingItems: formatted,
      totalPending: formatted.length,
      isConnected: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      pendingItems: [],
      error: err?.message,
      isConnected: false,
    });
  }
}
