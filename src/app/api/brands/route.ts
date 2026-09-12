import { NextResponse } from "next/server";
import { executeSafeQuery, query, testConnection, testLocalConnection, localQuery, cloudQuery } from "@/lib/db";
import { brands as fallbackBrands, Brand } from "@/lib/data/brands";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await executeSafeQuery<any[]>(
    "SELECT id, name, logo, series_list FROM brands ORDER BY name ASC",
    [],
    fallbackBrands
  );

  let formattedBrands: Brand[] = [];
  if (result.isConnected && Array.isArray(result.data)) {
    formattedBrands = result.data.map((row: any) => {
      const fallback = fallbackBrands.find((fb) => fb.id === row.id);
      return {
        id: row.id,
        name: row.name,
        slug: row.slug || fallback?.slug || row.id,
        logo: row.logo || fallback?.logo || "/logo/Pixkart.png",
        categoryType: fallback?.categoryType || "all",
        color: fallback?.color || "#415FFF",
        featured: fallback?.featured ?? false,
      };
    });
  } else {
    formattedBrands = result.data;
  }

  // Merge pending brand modifications from TiDB Cloud queue if local PC is offline
  try {
    const localHealth = await testLocalConnection();
    if (!localHealth.connected) {
      const [queueRows]: any = await cloudQuery(
        "SELECT action, entity_id, payload FROM cloud_catalog_queue WHERE entity_type = 'brand'"
      );
      if (queueRows && queueRows.length > 0) {
        for (const qItem of queueRows) {
          try {
            const payload = typeof qItem.payload === "string" ? JSON.parse(qItem.payload) : qItem.payload;
            if (qItem.action === "delete") {
              formattedBrands = formattedBrands.filter((b) => b.id !== qItem.entity_id);
            } else if (qItem.action === "upsert" && payload) {
              const existingIdx = formattedBrands.findIndex((b) => b.id === payload.id);
              if (existingIdx >= 0) {
                formattedBrands[existingIdx] = { ...formattedBrands[existingIdx], ...payload };
              } else {
                formattedBrands.push(payload);
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  return NextResponse.json({
    brands: formattedBrands,
    source: result.isConnected ? "mysql_database" : "offline_cache",
    total: formattedBrands.length,
  });
}

export async function POST(request: Request) {
  try {
    const brand: Brand = await request.json();

    if (!brand || !brand.id || !brand.name) {
      return NextResponse.json({ error: "Invalid brand payload" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudDb = false;
    let savedToCloudQueue = false;

    const upsertSql = `INSERT INTO brands (id, name, logo, series_list)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         logo = VALUES(logo),
         series_list = VALUES(series_list);`;

    const brandParams = [
      brand.id,
      brand.name,
      brand.logo || null,
      JSON.stringify((brand as any).series || (brand as any).series_list || []),
    ];

    if (localHealth.connected) {
      try {
        await localQuery(upsertSql, brandParams);
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Brands API] Direct DB write failed, buffering to cloud queue: ${dbErr.message}`);
      }
    }

    if (!savedToLocalDb) {
      try {
        await cloudQuery(upsertSql, brandParams);
        savedToCloudDb = true;
      } catch (cloudErr: any) {
        console.warn(`[Brands API] TiDB Cloud direct table write notice: ${cloudErr?.message}`);
      }

      try {
        const queueId = `cat_brand_${brand.id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'brand', 'upsert', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'upsert', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, brand.id, JSON.stringify(brand)]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Brands API] Cloud catalog queue buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      persisted: savedToLocalDb || savedToCloudDb || savedToCloudQueue,
      savedToLocalDb,
      savedToCloudDb,
      savedToCloudQueue,
      brandId: brand.id,
      message: savedToLocalDb
        ? "Brand saved directly to MySQL master."
        : savedToCloudDb || savedToCloudQueue
        ? "Brand saved to 24/7 TiDB Cloud buffer. Ready for PC Sync & Drain."
        : "Brand saved in client storage.",
    });
  } catch (err: any) {
    console.error("[Brand POST API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to save brand" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing brand ID" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let deletedFromLocalDb = false;
    let deletedFromCloudDb = false;
    let savedToCloudQueue = false;

    if (localHealth.connected) {
      try {
        await localQuery("DELETE FROM brands WHERE id = ?", [id]);
        deletedFromLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Brands API] Direct DB delete failed, buffering to cloud queue: ${dbErr.message}`);
      }

      try {
        await cloudQuery("DELETE FROM brands WHERE id = ?", [id]);
        await cloudQuery("DELETE FROM cloud_catalog_queue WHERE entity_id = ?", [id]);
        deletedFromCloudDb = true;
      } catch {}
    } else {
      try {
        await cloudQuery("DELETE FROM brands WHERE id = ?", [id]);
        deletedFromCloudDb = true;
      } catch {}

      try {
        const queueId = `cat_brand_del_${id}_${Date.now()}`;
        await cloudQuery(
          `INSERT INTO cloud_catalog_queue (id, entity_type, action, entity_id, payload)
           VALUES (?, 'brand', 'delete', ?, ?)
           ON DUPLICATE KEY UPDATE action = 'delete', payload = VALUES(payload), sync_attempts = 0, created_at = NOW();`,
          [queueId, id, JSON.stringify({ id })]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Brands API] Cloud catalog queue delete buffering notice: ${queueErr?.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedFromLocalDb || deletedFromCloudDb,
      savedToLocalDb: deletedFromLocalDb,
      savedToCloudQueue,
      brandId: id,
      message: deletedFromLocalDb
        ? "Brand deleted directly from MySQL master."
        : savedToCloudQueue
        ? "Brand deletion buffered in 24/7 Cloud Catalog Queue. Will sync on PC restart."
        : "Brand deleted from client storage.",
    });
  } catch (err: any) {
    console.error("[Brand DELETE API Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete brand" }, { status: 500 });
  }
}
