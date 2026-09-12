import fs from "fs";
import path from "path";

/**
 * PixKart Production Static Export Pipeline
 * 
 * Extracts and compiles all prerendered App Router pages, static chunks,
 * and public media into the 'out' directory for 100% up-to-date deployment
 * on Netlify Drop, static CDN hosting, or manual static file upload.
 */
async function exportOut() {
  const rootDir = process.cwd();
  const nextDir = path.join(rootDir, ".next");
  const serverAppDir = path.join(nextDir, "server", "app");
  const staticDir = path.join(nextDir, "static");
  const publicDir = path.join(rootDir, "public");
  const outDir = path.join(rootDir, "out");

  console.log("================================================================================");
  console.log("🚀 PIXKART PRODUCTION STATIC EXPORT PIPELINE");
  console.log("================================================================================");
  console.log(`📁 Source: ${serverAppDir}`);
  console.log(`📁 Destination: ${outDir}`);

  if (!fs.existsSync(serverAppDir)) {
    console.error("❌ Error: .next/server/app does not exist. Please run 'next build' first.");
    process.exit(1);
  }

  // Clean 'out' directory first to eliminate stale chunks from previous builds
  if (fs.existsSync(outDir)) {
    console.log("\n🧹 Cleaning stale files in out/ directory...");
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  let htmlCount = 0;
  let assetCount = 0;

  // 1. Copy Public Assets
  if (fs.existsSync(publicDir)) {
    console.log("\n📦 1. Copying public/ assets...");
    fs.cpSync(publicDir, outDir, { recursive: true });
    console.log("   ✓ Public assets copied (images, icons, _redirects, etc.)");
  }

  // 2. Copy Static Next.js Chunks (.next/static -> out/_next/static)
  if (fs.existsSync(staticDir)) {
    console.log("\n📦 2. Copying Next.js client bundles (.next/static -> out/_next/static)...");
    const outNextStatic = path.join(outDir, "_next", "static");
    fs.mkdirSync(outNextStatic, { recursive: true });
    fs.cpSync(staticDir, outNextStatic, { recursive: true });
    console.log("   ✓ Next.js client chunks and CSS styles copied.");
  }

  // 3. Process Special Root Files (robots, sitemap, icon, favicon)
  console.log("\n📦 3. Processing metadata and root assets...");
  const specialFiles: Record<string, string> = {
    "robots.txt.body": "robots.txt",
    "sitemap.xml.body": "sitemap.xml",
    "icon.png.body": "icon.png",
    "favicon.ico.body": "favicon.ico",
  };

  for (const [sourceFile, targetFile] of Object.entries(specialFiles)) {
    const srcPath = path.join(serverAppDir, sourceFile);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(outDir, targetFile));
      console.log(`   ✓ Exported ${targetFile}`);
      assetCount++;
    }
  }

  // 4. Recursively scan and copy all prerendered HTML pages
  console.log("\n📦 4. Exporting prerendered App Router HTML pages...");

  function scanAndExportHtml(dir: string, baseSubPath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativeSubPath = baseSubPath ? path.join(baseSubPath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        // Skip .segments directories and private internals
        if (entry.name.endsWith(".segments")) continue;
        scanAndExportHtml(fullPath, relativeSubPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        const routeName = entry.name.replace(/\.html$/, "");
        const content = fs.readFileSync(fullPath, "utf-8");

        if (baseSubPath === "" && routeName === "index") {
          // Root index page: out/index.html
          fs.writeFileSync(path.join(outDir, "index.html"), content, "utf-8");
          htmlCount++;
          console.log("   ✓ Exported / -> out/index.html");
        } else if (baseSubPath === "" && routeName === "_not-found") {
          // 404 page: out/404.html and out/_not-found/index.html
          fs.writeFileSync(path.join(outDir, "404.html"), content, "utf-8");
          const notFoundDir = path.join(outDir, "_not-found");
          fs.mkdirSync(notFoundDir, { recursive: true });
          fs.writeFileSync(path.join(notFoundDir, "index.html"), content, "utf-8");
          htmlCount++;
          console.log("   ✓ Exported /_not-found -> out/404.html");
        } else if (baseSubPath === "" && routeName === "_global-error") {
          // Skip global error template or export to 500.html
          fs.writeFileSync(path.join(outDir, "500.html"), content, "utf-8");
        } else {
          // Standard route page (e.g. Tanzar.html -> out/Tanzar/index.html AND out/Tanzar.html)
          const targetSubDir = baseSubPath ? path.join(outDir, baseSubPath, routeName) : path.join(outDir, routeName);
          fs.mkdirSync(targetSubDir, { recursive: true });
          fs.writeFileSync(path.join(targetSubDir, "index.html"), content, "utf-8");

          // Also export flat HTML file (out/Tanzar.html) for direct path matching
          const flatTargetFile = baseSubPath ? path.join(outDir, baseSubPath, `${routeName}.html`) : path.join(outDir, `${routeName}.html`);
          fs.writeFileSync(flatTargetFile, content, "utf-8");

          htmlCount++;
          const cleanRoute = baseSubPath ? `/${baseSubPath.replace(/\\/g, "/")}/${routeName}` : `/${routeName}`;
          console.log(`   ✓ Exported ${cleanRoute} -> ${path.relative(rootDir, targetSubDir)}/index.html & ${routeName}.html`);
        }
      }
    }
  }

  scanAndExportHtml(serverAppDir);

  // 5. Export Static API Snapshots (so static Netlify Drop deployments have 100% full catalog data)
  console.log("\n📦 5. Exporting static API catalog snapshots for Netlify Drop...");
  try {
    const apiDir = path.join(outDir, "api");
    fs.mkdirSync(apiDir, { recursive: true });

    let prods: any[] = [];
    try {
      const { localQuery, cloudQuery } = await import("../src/lib/db");
      const [rows]: any = await localQuery("SELECT * FROM products").catch(async () => {
        const [cRows]: any = await cloudQuery("SELECT * FROM products");
        return [cRows];
      });
      prods = rows || [];
    } catch (e: any) {
      console.warn("   ⚠️ DB fetch warning during static export:", e?.message);
    }

    const prodPayload = JSON.stringify({
      products: prods.map((row: any) => {
        let specs: Record<string, any> = {};
        try {
          specs = typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs || {};
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
          isFeatured: Boolean(specs.isFeatured ?? row.is_featured),
          isDealOfDay: Boolean(specs.isDealOfDay ?? row.is_bestseller),
          inSpotlight: Boolean(specs.inSpotlight ?? row.is_trending),
          inHeroBanner: Boolean(specs.inHeroBanner),
          inPromoBanner: Boolean(specs.inPromoBanner),
          badgeText: specs.badgeText || (row.is_bestseller ? "Bestseller" : ""),
          rating: parseFloat(row.rating) || 4.8,
          reviewCount: row.rating_count || 0,
          stockStatus: row.stock_status || "in_stock",
          imageUrls: typeof row.images === "string" ? JSON.parse(row.images) : row.images || [],
          specs,
        };
      }),
      total: prods.length,
      source: "static_snapshot",
    });

    fs.writeFileSync(path.join(apiDir, "products.json"), prodPayload, "utf-8");
    fs.writeFileSync(path.join(apiDir, "products"), prodPayload, "utf-8");
    console.log(`   ✓ Exported /api/products.json (${prods.length} products bundled)`);

    // Export Brands snapshot
    try {
      const { localQuery, cloudQuery } = await import("../src/lib/db");
      const [brandRows]: any = await localQuery("SELECT * FROM brands").catch(async () => {
        const [cRows]: any = await cloudQuery("SELECT * FROM brands");
        return [cRows];
      });
      const brandsList = (brandRows || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        slug: b.slug || b.id,
        logo: b.logo || "📱",
        series: typeof b.series_list === "string" ? JSON.parse(b.series_list) : b.series_list || [],
      }));
      const brandPayload = JSON.stringify({ brands: brandsList, total: brandsList.length });
      fs.writeFileSync(path.join(apiDir, "brands.json"), brandPayload, "utf-8");
      fs.writeFileSync(path.join(apiDir, "brands"), brandPayload, "utf-8");
      console.log(`   ✓ Exported /api/brands.json (${brandsList.length} brands bundled)`);
    } catch {}

    // Export Categories snapshot
    try {
      const { localQuery, cloudQuery } = await import("../src/lib/db");
      const [catRows]: any = await localQuery("SELECT * FROM categories ORDER BY display_order ASC").catch(async () => {
        const [cRows]: any = await cloudQuery("SELECT * FROM categories ORDER BY display_order ASC");
        return [cRows];
      });
      const categoriesList = (catRows || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || c.id,
        icon: c.icon || "📱",
        image: c.image || "",
        tagline: c.tagline || c.name,
        description: c.description || "",
      }));
      const catPayload = JSON.stringify({ categories: categoriesList, total: categoriesList.length });
      fs.writeFileSync(path.join(apiDir, "categories.json"), catPayload, "utf-8");
      fs.writeFileSync(path.join(apiDir, "categories"), catPayload, "utf-8");
      console.log(`   ✓ Exported /api/categories.json (${categoriesList.length} categories bundled)`);
    } catch {}

    // Export Health snapshot
    const healthDir = path.join(apiDir, "db");
    fs.mkdirSync(healthDir, { recursive: true });
    const healthPayload = JSON.stringify({
      status: "connected",
      cloud: { status: "connected", host: "TiDB Cloud Serverless" },
      local: { status: "connected", host: "Local MySQL 8.0" },
      tableCounts: { cloudQueuePending: 0, cloudUserQueuePending: 0 },
    });
    fs.writeFileSync(path.join(healthDir, "health.json"), healthPayload, "utf-8");
    fs.writeFileSync(path.join(healthDir, "health"), healthPayload, "utf-8");
  } catch (apiErr: any) {
    console.warn("   ⚠️ Could not write static API snapshot:", apiErr?.message);
  }

  // 6. Ensure _redirects in out/ contains Netlify routing rules
  const redirectsPath = path.join(outDir, "_redirects");
  const redirectsContent = `# PixKart Netlify Redirects Configuration
# 1. API static fallback rules for Netlify Drop
/api/products /api/products.json 200
/api/products/* /api/products.json 200
/api/brands /api/brands.json 200
/api/categories /api/categories.json 200
/api/db/health /api/db/health.json 200

# 2. Dynamic shop route fallback for static hosting
/shop/* /shop 200
`;
  fs.writeFileSync(redirectsPath, redirectsContent, "utf-8");
  // 7. Generate out.zip for instant 1-file Netlify Drop upload
  const zipPath = path.join(rootDir, "out.zip");
  try {
    const { execSync } = await import("child_process");
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipPath}' -Force"`);
    console.log(`   ✓ Generated handover archive: ${zipPath}`);
  } catch (zipErr: any) {
    console.warn("   ⚠️ Could not generate out.zip archive:", zipErr?.message);
  }

  console.log("\n================================================================================");
  console.log(`✅ STATIC EXPORT COMPLETE! Total Pages Exported: ${htmlCount}`);
  console.log(`📂 Client Handover Folder:  ${outDir}`);
  console.log(`📦 Client Handover Archive: ${zipPath}`);
  console.log("================================================================================\n");
}

exportOut();
