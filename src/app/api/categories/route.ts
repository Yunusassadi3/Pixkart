import { NextResponse } from "next/server";
import { executeSafeQuery, query, testConnection, testLocalConnection, localQuery, cloudQuery } from "@/lib/db";
import { categories as fallbackCategories, Category } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await executeSafeQuery<any[]>(
    "SELECT id, name, slug, icon, image, display_order FROM categories ORDER BY display_order ASC, name ASC",
    [],
    fallbackCategories
  );

  let formattedCategories: Category[] = [];
  if (result.isConnected && Array.isArray(result.data)) {
    formattedCategories = result.data.map((row: any) => {
      const fallback = fallbackCategories.find((fc) => fc.id === row.id || fc.slug === row.slug);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        icon: row.icon || fallback?.icon || "📱",
        image: row.image || fallback?.image || "/images/categories/category-1-cases.png",
        tagline: fallback?.tagline || "",
        description: fallback?.description || "",
        color: fallback?.color || "#3B82F6",
        gradient: fallback?.gradient || "from-blue-900/40 to-indigo-900/20",
        featured: fallback?.featured ?? true,
      };
    });
  } else {
    formattedCategories = result.data;
  }

  return NextResponse.json({
    categories: formattedCategories,
    source: result.isConnected ? "mysql_database" : "offline_cache",
    total: formattedCategories.length,
  });
}

export async function POST(request: Request) {
  try {
    const cat: Category = await request.json();

    if (!cat || !cat.id || !cat.name) {
      return NextResponse.json({ error: "Invalid category payload" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudQueue = false;

    if (localHealth.connected) {
      try {
        await localQuery(
          `INSERT INTO categories (id, name, slug, icon, image, display_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             slug = VALUES(slug),
             icon = VALUES(icon),
             image = VALUES(image),
             display_order = VALUES(display_order);`,
          [
            cat.id,
            cat.name,
            cat.slug || cat.id,
            cat.icon || null,
            cat.image || null,
            Number((cat as any).displayOrder ?? (cat as any).display_order) || 0,
          ]
        );
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Categories API] Direct DB write failed, buffering to cloud queue: ${dbErr.message}`);
      }
    }

    if (!savedToLocalDb) {
      try {
        const queueId = `cat_category_${cat.id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'category', 'upsert', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'upsert', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, cat.id, JSON.stringify(cat)]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Categories API] Cloud catalog queue buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      persisted: savedToLocalDb,
      savedToLocalDb,
      savedToCloudQueue,
      categoryId: cat.id,
      message: savedToLocalDb
        ? "Category saved directly to MySQL master."
        : savedToCloudQueue
        ? "Category buffered in 24/7 Cloud Catalog Queue. Will sync on PC restart."
        : "Category saved in client storage.",
    });
  } catch (err: any) {
    console.error("[Category POST API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to save category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let deletedFromLocalDb = false;
    let savedToCloudQueue = false;

    if (localHealth.connected) {
      try {
        await localQuery("DELETE FROM categories WHERE id = ?", [id]);
        deletedFromLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Categories API] Direct DB delete failed, buffering to cloud queue: ${dbErr.message}`);
      }
    }

    if (!deletedFromLocalDb) {
      try {
        const queueId = `cat_category_del_${id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'category', 'delete', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'delete', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, id, JSON.stringify({ id })]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Categories API] Cloud catalog queue delete buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedFromLocalDb,
      savedToLocalDb: deletedFromLocalDb,
      savedToCloudQueue,
      categoryId: id,
      message: deletedFromLocalDb
        ? "Category deleted directly from MySQL master."
        : savedToCloudQueue
        ? "Category deletion buffered in 24/7 Cloud Catalog Queue. Will sync on PC restart."
        : "Category deleted from client storage.",
    });
  } catch (err: any) {
    console.error("[Category DELETE API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete category" }, { status: 500 });
  }
}
