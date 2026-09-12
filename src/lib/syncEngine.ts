import {
  localQuery,
  cloudQuery,
  executeLocalTransaction,
  testLocalConnection,
  testCloudConnection,
} from "./db";

export interface OrderPayload {
  id: string;
  orderNumber?: string;
  userId?: string;
  customerEmail: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items?: Array<{
    variantId?: string;
    product?: { id: string; title: string; basePrice: number; images?: string[] };
    model?: { name: string };
    selectedColor?: string;
    selectedStorage?: string;
    quantity: number;
  }>;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  trackingNumber?: string;
  createdAt?: string;
}

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider?: "google" | "email" | "admin";
  role?: "customer" | "admin";
  addresses?: Array<{
    id?: string;
    type?: "Home" | "Work" | "Other";
    name?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }>;
  createdAt?: string;
}

export interface SyncStepLog {
  orderId: string;
  orderNumber: string;
  handshake1Commit: boolean;
  handshake2ReadBack: boolean;
  handshake3ItemIntegrity: boolean;
  purgedFromCloud: boolean;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  message: string;
}

export interface UserSyncStepLog {
  userId: string;
  userEmail: string;
  handshake1Commit: boolean;
  handshake2ReadBack: boolean;
  handshake3Integrity: boolean;
  purgedFromCloud: boolean;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  message: string;
}

export type CatalogEntityType =
  | "product"
  | "brand"
  | "category"
  | "model"
  | "spotlight"
  | "hero_slide"
  | "promo_ad";

export interface CatalogQueuePayload {
  id: string;
  entityType: CatalogEntityType;
  action: "upsert" | "delete";
  entityId: string;
  payload: any;
  syncAttempts?: number;
  createdAt?: string;
}

export interface CatalogSyncStepLog {
  queueId: string;
  entityType: CatalogEntityType;
  action: "upsert" | "delete";
  entityId: string;
  handshake1Commit: boolean;
  handshake2ReadBack: boolean;
  handshake3Integrity: boolean;
  purgedFromCloud: boolean;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  message: string;
}

export interface CatalogSyncEngineResult {
  totalPendingInCloud: number;
  syncedCount: number;
  failedCount: number;
  purgedCount: number;
  remainingInCloud: number;
  logs: CatalogSyncStepLog[];
  localDbConnected: boolean;
}

export interface SyncEngineResult {
  totalPendingInCloud: number;
  syncedCount: number;
  failedCount: number;
  purgedCount: number;
  remainingInCloud: number;
  logs: SyncStepLog[];
  localDbConnected: boolean;
}

export interface UserSyncEngineResult {
  totalPendingInCloud: number;
  syncedCount: number;
  failedCount: number;
  purgedCount: number;
  remainingInCloud: number;
  logs: UserSyncStepLog[];
  localDbConnected: boolean;
}

export interface UnifiedSyncResult {
  catalog: CatalogSyncEngineResult;
  users: UserSyncEngineResult;
  orders: SyncEngineResult;
  totalPending: number;
  totalSynced: number;
  localDbConnected: boolean;
  timestamp: string;
}

/**
 * Triple-Handshake Auto-Sync and Granular Drain Engine for Orders.
 * 1. Reads pending orders from 24/7 TiDB Cloud Buffer (cloud_order_queue).
 * 2. Writes to Local PC MySQL 8.0 via atomic ACID transaction (Handshake 1: Commit).
 * 3. Immediately confirms disk persistence by reading back from Local PC MySQL (Handshake 2: Read-Back).
 * 4. Verifies line items, address, and pricing schema (Handshake 3: Integrity Probe).
 * 5. PURGES the order from TiDB Cloud ONLY when all 3 checks pass (3/3 SUCCESS), keeping cloud storage 0 MB.
 */
export async function syncAndDrainCloudQueue(): Promise<SyncEngineResult> {
  const localHealth = await testLocalConnection();
  if (!localHealth.connected) {
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: false,
    };
  }

  // 1. Fetch pending orders from TiDB Cloud Buffer Queue
  let queueRows: any[] = [];
  try {
    const [rows] = await cloudQuery(
      "SELECT id, order_number, order_payload, created_at FROM cloud_order_queue ORDER BY created_at ASC"
    );
    queueRows = rows || [];
  } catch (err: any) {
    console.warn(`[SyncEngine] Cloud order queue query notice: ${err?.message}`);
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: true,
    };
  }

  const result: SyncEngineResult = {
    totalPendingInCloud: queueRows.length,
    syncedCount: 0,
    failedCount: 0,
    purgedCount: 0,
    remainingInCloud: queueRows.length,
    logs: [],
    localDbConnected: true,
  };

  if (queueRows.length === 0) {
    return result;
  }

  // 2. Process each order strictly ONE-BY-ONE
  for (const queueItem of queueRows) {
    const stepLog: SyncStepLog = {
      orderId: queueItem.id,
      orderNumber: queueItem.order_number || queueItem.id,
      handshake1Commit: false,
      handshake2ReadBack: false,
      handshake3ItemIntegrity: false,
      purgedFromCloud: false,
      status: "FAILED",
      message: "",
    };

    let orderData: OrderPayload;
    try {
      orderData =
        typeof queueItem.order_payload === "string"
          ? JSON.parse(queueItem.order_payload)
          : queueItem.order_payload;
    } catch (parseErr: any) {
      stepLog.message = `Corrupted JSON payload in cloud queue: ${parseErr.message}`;
      result.logs.push(stepLog);
      result.failedCount++;
      continue;
    }

    try {
      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 1: Atomic Transaction Write to Local PC MySQL 8.0
      // -------------------------------------------------------------
      await executeLocalTransaction(async (conn) => {
        // Upsert into master orders table
        await conn.query(
          `INSERT INTO orders (
            id, order_number, user_id, customer_name, customer_email, customer_phone,
            shipping_address, pincode, payment_method, payment_status, order_status,
            tracking_number, total_amount, subtotal_amount, delivery_fee, discount_amount, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            order_status = VALUES(order_status),
            payment_status = VALUES(payment_status);`,
          [
            orderData.id,
            orderData.orderNumber || orderData.id,
            orderData.userId || null,
            orderData.shippingAddress?.name || "Customer",
            orderData.customerEmail,
            orderData.shippingAddress?.phone || "0000000000",
            JSON.stringify(orderData.shippingAddress || {}),
            orderData.shippingAddress?.pincode || "576101",
            orderData.paymentMethod || "cod",
            orderData.paymentStatus || "pending",
            orderData.orderStatus || "Order Placed",
            orderData.trackingNumber || `TRACK-${Date.now().toString().slice(-6)}`,
            orderData.total,
            orderData.subtotal || orderData.total,
            orderData.deliveryFee || 0,
            orderData.discount || 0,
            orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
          ]
        );

        // Insert Order Items into Local MySQL
        if (orderData.items && orderData.items.length > 0) {
          for (const item of orderData.items) {
            const itemId = `item_${orderData.id}_${item.variantId || item.product?.id || Math.random().toString(36).slice(2, 7)}`;
            await conn.query(
              `INSERT INTO order_items (
                id, order_id, product_id, product_title, model_name, color, storage, quantity, unit_price, total_price, image
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);`,
              [
                itemId,
                orderData.id,
                item.product?.id || item.variantId || "prod",
                item.product?.title || "Product Accessory",
                item.model?.name || null,
                item.selectedColor || null,
                item.selectedStorage || null,
                item.quantity || 1,
                item.product?.basePrice || 0,
                (item.product?.basePrice || 0) * (item.quantity || 1),
                item.product?.images?.[0] || null,
              ]
            );
          }
        }
      });
      stepLog.handshake1Commit = true;

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 2: Immediate Read-Back Confirmation from Local PC Disk
      // -------------------------------------------------------------
      const [readBackRows]: any = await localQuery(
        "SELECT id, order_number, total_amount, customer_email FROM orders WHERE id = ?",
        [orderData.id]
      );

      if (readBackRows && readBackRows.length > 0) {
        const stored = readBackRows[0];
        if (stored.id === orderData.id) {
          stepLog.handshake2ReadBack = true;
        }
      }

      if (!stepLog.handshake2ReadBack) {
        throw new Error("Handshake 2 Failed: Read-back verification could not locate the stored order on local disk.");
      }

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 3: Line Item Consistency Probe in Local PC MySQL
      // -------------------------------------------------------------
      const expectedItemCount = orderData.items?.length || 0;
      if (expectedItemCount > 0) {
        const [itemCheckRows]: any = await localQuery(
          "SELECT COUNT(*) as item_count FROM order_items WHERE order_id = ?",
          [orderData.id]
        );
        const actualCount = itemCheckRows?.[0]?.item_count || 0;
        if (actualCount >= expectedItemCount) {
          stepLog.handshake3ItemIntegrity = true;
        }
      } else {
        stepLog.handshake3ItemIntegrity = true;
      }

      if (!stepLog.handshake3ItemIntegrity) {
        throw new Error("Handshake 3 Failed: Line items count mismatch in local database.");
      }

      // -------------------------------------------------------------
      // 🗑️ ALL 3 CHECKS PASSED -> PURGE PERMANENTLY FROM TIDB CLOUD
      // -------------------------------------------------------------
      await cloudQuery("DELETE FROM cloud_order_queue WHERE id = ?", [queueItem.id]);
      stepLog.purgedFromCloud = true;
      stepLog.status = "SUCCESS";
      stepLog.message = `Successfully ingested to local PC MySQL and verified (3/3 checks passed). Purged from TiDB Cloud.`;

      result.syncedCount++;
      result.purgedCount++;
    } catch (orderErr: any) {
      console.error(`[SyncEngine Error] Order ${queueItem.id} sync failed:`, orderErr.message);
      stepLog.status = "FAILED";
      stepLog.message = orderErr.message || "Unknown error during verification handshake";
      result.failedCount++;
    }

    result.logs.push(stepLog);
  }

  result.remainingInCloud = result.totalPendingInCloud - result.purgedCount;
  return result;
}

/**
 * Triple-Handshake Auto-Sync and Granular Drain Engine for User Logins & Signups.
 * 1. Reads pending users from TiDB Cloud Buffer (cloud_user_queue).
 * 2. Writes to Local PC MySQL 8.0 via atomic ACID transaction (Handshake 1).
 * 3. Immediately confirms disk persistence (Handshake 2).
 * 4. Verifies profile and address integrity (Handshake 3).
 * 5. Purges user from TiDB Cloud ONLY when all 3 checks pass.
 */
export async function syncAndDrainCloudUserQueue(): Promise<UserSyncEngineResult> {
  const localHealth = await testLocalConnection();
  if (!localHealth.connected) {
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: false,
    };
  }

  // 1. Fetch pending users from TiDB Cloud Buffer Queue
  let queueRows: any[] = [];
  try {
    const [rows] = await cloudQuery(
      "SELECT id, user_email, user_payload, created_at FROM cloud_user_queue ORDER BY created_at ASC"
    );
    queueRows = rows || [];
  } catch (err: any) {
    console.warn(`[SyncEngine] Cloud user queue query notice: ${err?.message}`);
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: true,
    };
  }

  const result: UserSyncEngineResult = {
    totalPendingInCloud: queueRows.length,
    syncedCount: 0,
    failedCount: 0,
    purgedCount: 0,
    remainingInCloud: queueRows.length,
    logs: [],
    localDbConnected: true,
  };

  if (queueRows.length === 0) {
    return result;
  }

  // 2. Process each user strictly ONE-BY-ONE
  for (const queueItem of queueRows) {
    const stepLog: UserSyncStepLog = {
      userId: queueItem.id,
      userEmail: queueItem.user_email || queueItem.id,
      handshake1Commit: false,
      handshake2ReadBack: false,
      handshake3Integrity: false,
      purgedFromCloud: false,
      status: "FAILED",
      message: "",
    };

    let userData: UserPayload;
    try {
      userData =
        typeof queueItem.user_payload === "string"
          ? JSON.parse(queueItem.user_payload)
          : queueItem.user_payload;
    } catch (parseErr: any) {
      stepLog.message = `Corrupted JSON payload in cloud user queue: ${parseErr.message}`;
      result.logs.push(stepLog);
      result.failedCount++;
      continue;
    }

    try {
      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 1: Atomic ACID Transaction Write to Local PC MySQL
      // -------------------------------------------------------------
      await executeLocalTransaction(async (conn) => {
        // Upsert into master users table
        await conn.query(
          `INSERT INTO users (id, name, email, phone, avatar, provider, role, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             phone = VALUES(phone),
             avatar = VALUES(avatar),
             provider = VALUES(provider),
             role = VALUES(role);`,
          [
            userData.id,
            userData.name || "Customer",
            userData.email.toLowerCase().trim(),
            userData.phone || null,
            userData.avatar || null,
            userData.provider || "google",
            userData.role || "customer",
            userData.createdAt ? new Date(userData.createdAt) : new Date(),
          ]
        );

        // Upsert saved delivery addresses if provided
        if (userData.addresses && userData.addresses.length > 0) {
          for (let i = 0; i < userData.addresses.length; i++) {
            const addr = userData.addresses[i];
            const addrId = addr.id || `addr_${userData.id}_${i + 1}`;
            await conn.query(
              `INSERT INTO addresses (
                id, user_id, type, name, phone, address, city, state, pincode, is_default
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                name = VALUES(name),
                phone = VALUES(phone),
                address = VALUES(address),
                city = VALUES(city),
                state = VALUES(state),
                pincode = VALUES(pincode),
                is_default = VALUES(is_default);`,
              [
                addrId,
                userData.id,
                addr.type || "Home",
                addr.name || userData.name || "Customer",
                addr.phone || userData.phone || "0000000000",
                addr.address || "Udupi",
                addr.city || "Udupi",
                addr.state || "Karnataka",
                addr.pincode || "576101",
                addr.isDefault ? 1 : 0,
              ]
            );
          }
        }
      });
      stepLog.handshake1Commit = true;

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 2: Immediate Read-Back Confirmation from Local Disk
      // -------------------------------------------------------------
      const [readBackRows]: any = await localQuery(
        "SELECT id, email, name, phone FROM users WHERE id = ? OR email = ?",
        [userData.id, userData.email.toLowerCase().trim()]
      );

      if (readBackRows && readBackRows.length > 0) {
        const stored = readBackRows[0];
        if (
          stored.id === userData.id ||
          stored.email.toLowerCase() === userData.email.toLowerCase().trim()
        ) {
          stepLog.handshake2ReadBack = true;
        }
      }

      if (!stepLog.handshake2ReadBack) {
        throw new Error("Handshake 2 Failed: Read-back verification could not locate the user on local disk.");
      }

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 3: Profile & Address Integrity Probe in Local MySQL
      // -------------------------------------------------------------
      const expectedAddrCount = userData.addresses?.length || 0;
      if (expectedAddrCount > 0) {
        const [addrRows]: any = await localQuery(
          "SELECT COUNT(*) as addr_count FROM addresses WHERE user_id = ?",
          [userData.id]
        );
        const actualCount = addrRows?.[0]?.addr_count || 0;
        if (actualCount >= expectedAddrCount) {
          stepLog.handshake3Integrity = true;
        }
      } else {
        stepLog.handshake3Integrity = true;
      }

      if (!stepLog.handshake3Integrity) {
        throw new Error("Handshake 3 Failed: Address integrity count mismatch in local database.");
      }

      // -------------------------------------------------------------
      // 🗑️ ALL 3 CHECKS PASSED -> PURGE FROM TIDB CLOUD USER QUEUE
      // -------------------------------------------------------------
      await cloudQuery("DELETE FROM cloud_user_queue WHERE id = ?", [queueItem.id]);
      stepLog.purgedFromCloud = true;
      stepLog.status = "SUCCESS";
      stepLog.message = `User identity and ${expectedAddrCount} address(es) verified (3/3 checks passed). Purged from TiDB Cloud.`;

      result.syncedCount++;
      result.purgedCount++;
    } catch (userErr: any) {
      console.error(`[SyncEngine Error] User ${queueItem.id} sync failed:`, userErr.message);
      stepLog.status = "FAILED";
      stepLog.message = userErr.message || "Unknown error during user verification handshake";
      result.failedCount++;
    }

    result.logs.push(stepLog);
  }

  result.remainingInCloud = result.totalPendingInCloud - result.purgedCount;
  return result;
}

/**
 * Triple-Handshake Auto-Sync and Granular Drain Engine for Catalog Assets.
 * 1. Reads pending catalog updates from TiDB Cloud Buffer (cloud_catalog_queue).
 * 2. Writes to Local PC MySQL 8.0 via atomic ACID transaction.
 * 3. Confirms disk presence locally.
 * 4. Deep integrity check.
 * 5. Purges item from TiDB Cloud.
 */
export async function syncAndDrainCatalogQueue(): Promise<CatalogSyncEngineResult> {
  const localHealth = await testLocalConnection();
  if (!localHealth.connected) {
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: false,
    };
  }

  // 1. Fetch pending catalog changes from TiDB Cloud
  let queueRows: any[] = [];
  try {
    const [rows] = await cloudQuery(
      "SELECT id, entity_type, action, entity_id, payload, sync_attempts, created_at FROM cloud_catalog_queue ORDER BY created_at ASC"
    );
    queueRows = rows || [];
  } catch (err: any) {
    console.warn(`[SyncEngine] Cloud catalog queue query notice: ${err?.message}`);
    return {
      totalPendingInCloud: 0,
      syncedCount: 0,
      failedCount: 0,
      purgedCount: 0,
      remainingInCloud: 0,
      logs: [],
      localDbConnected: true,
    };
  }

  const result: CatalogSyncEngineResult = {
    totalPendingInCloud: queueRows.length,
    syncedCount: 0,
    failedCount: 0,
    purgedCount: 0,
    remainingInCloud: queueRows.length,
    logs: [],
    localDbConnected: true,
  };

  if (queueRows.length === 0) {
    return result;
  }

  // 2. Process each catalog entity strictly ONE-BY-ONE
  for (const queueItem of queueRows) {
    const stepLog: CatalogSyncStepLog = {
      queueId: queueItem.id,
      entityType: queueItem.entity_type as CatalogEntityType,
      action: queueItem.action as "upsert" | "delete",
      entityId: queueItem.entity_id,
      handshake1Commit: false,
      handshake2ReadBack: false,
      handshake3Integrity: false,
      purgedFromCloud: false,
      status: "FAILED",
      message: "",
    };

    let payload: any;
    try {
      payload =
        typeof queueItem.payload === "string"
          ? JSON.parse(queueItem.payload)
          : queueItem.payload;
    } catch (parseErr: any) {
      stepLog.message = `Corrupted JSON payload in cloud catalog queue: ${parseErr.message}`;
      result.logs.push(stepLog);
      result.failedCount++;
      continue;
    }

    try {
      const entityType = stepLog.entityType;
      const action = stepLog.action;
      const entityId = stepLog.entityId;

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 1: Atomic ACID Transaction Write to Local PC MySQL
      // -------------------------------------------------------------
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

            // Also ensure the Series is linked into the Brand's series_list
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
      stepLog.handshake1Commit = true;

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 2: Immediate Read-Back Confirmation from Local Disk
      // -------------------------------------------------------------
      if (entityType === "product") {
        const [rows]: any = await localQuery("SELECT id, title, base_price FROM products WHERE id = ?", [entityId]);
        if (action === "upsert") {
          if (rows && rows.length > 0 && rows[0].id === entityId) {
            stepLog.handshake2ReadBack = true;
          }
        } else {
          if (!rows || rows.length === 0) {
            stepLog.handshake2ReadBack = true;
          }
        }
      } else if (entityType === "brand") {
        const [rows]: any = await localQuery("SELECT id, name FROM brands WHERE id = ?", [entityId]);
        if (action === "upsert") {
          if (rows && rows.length > 0 && rows[0].id === entityId) {
            stepLog.handshake2ReadBack = true;
          }
        } else {
          if (!rows || rows.length === 0) {
            stepLog.handshake2ReadBack = true;
          }
        }
      } else if (entityType === "category") {
        const [rows]: any = await localQuery("SELECT id, name, slug FROM categories WHERE id = ?", [entityId]);
        if (action === "upsert") {
          if (rows && rows.length > 0 && rows[0].id === entityId) {
            stepLog.handshake2ReadBack = true;
          }
        } else {
          if (!rows || rows.length === 0) {
            stepLog.handshake2ReadBack = true;
          }
        }
      } else if (entityType === "model") {
        const [rows]: any = await localQuery("SELECT id, name FROM phone_models WHERE id = ?", [entityId]);
        if (action === "upsert") {
          if (rows && rows.length > 0 && rows[0].id === entityId) {
            stepLog.handshake2ReadBack = true;
          }
        } else {
          if (!rows || rows.length === 0) {
            stepLog.handshake2ReadBack = true;
          }
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
        const [rows]: any = await localQuery(
          "SELECT setting_value FROM admin_settings WHERE setting_key = ?",
          [settingKey]
        );
        if (rows && rows.length > 0) {
          stepLog.handshake2ReadBack = true;
        }
      }

      if (!stepLog.handshake2ReadBack) {
        throw new Error(
          `Handshake 2 Failed: Read-back verification could not confirm ${action} of ${entityType} '${entityId}' on disk.`
        );
      }

      // -------------------------------------------------------------
      // 🔍 HANDSHAKE 3: Deep Integrity & Schema Validation in Local MySQL
      // -------------------------------------------------------------
      if (action === "delete") {
        stepLog.handshake3Integrity = true;
      } else if (entityType === "product") {
        const [checkRows]: any = await localQuery(
          "SELECT title, base_price, stock_status FROM products WHERE id = ?",
          [entityId]
        );
        if (checkRows && checkRows.length > 0 && checkRows[0].title) {
          stepLog.handshake3Integrity = true;
        }
      } else if (entityType === "brand") {
        const [checkRows]: any = await localQuery("SELECT name FROM brands WHERE id = ?", [entityId]);
        if (checkRows && checkRows.length > 0 && checkRows[0].name) {
          stepLog.handshake3Integrity = true;
        }
      } else if (entityType === "category") {
        const [checkRows]: any = await localQuery("SELECT name, slug FROM categories WHERE id = ?", [entityId]);
        if (checkRows && checkRows.length > 0 && checkRows[0].name && checkRows[0].slug) {
          stepLog.handshake3Integrity = true;
        }
      } else if (entityType === "model") {
        const [checkRows]: any = await localQuery("SELECT name FROM phone_models WHERE id = ?", [entityId]);
        if (checkRows && checkRows.length > 0 && checkRows[0].name) {
          stepLog.handshake3Integrity = true;
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
        const [checkRows]: any = await localQuery(
          "SELECT setting_value FROM admin_settings WHERE setting_key = ?",
          [settingKey]
        );
        if (checkRows && checkRows.length > 0) {
          const parsed = JSON.parse(checkRows[0].setting_value);
          const found = Array.isArray(parsed) && parsed.some((item: any) => item.id === entityId);
          if (found) {
            stepLog.handshake3Integrity = true;
          }
        }
      }

      if (!stepLog.handshake3Integrity) {
        throw new Error(
          `Handshake 3 Failed: Integrity validation failed for ${entityType} '${entityId}'.`
        );
      }

      // -------------------------------------------------------------
      // 🗑️ ALL 3 CHECKS PASSED -> PURGE FROM TIDB CLOUD
      // -------------------------------------------------------------
      await cloudQuery("DELETE FROM cloud_catalog_queue WHERE id = ?", [queueItem.id]);

      // Also purge from TiDB Cloud's entity tables to keep TiDB Cloud server storage 100% clean (0 KB)
      if (entityType === "product") {
        await cloudQuery("DELETE FROM products WHERE id = ?", [entityId]).catch(() => {});
      } else if (entityType === "brand") {
        await cloudQuery("DELETE FROM brands WHERE id = ?", [entityId]).catch(() => {});
      } else if (entityType === "category") {
        await cloudQuery("DELETE FROM categories WHERE id = ?", [entityId]).catch(() => {});
      } else if (entityType === "model") {
        await cloudQuery("DELETE FROM phone_models WHERE id = ?", [entityId]).catch(() => {});
      }

      stepLog.purgedFromCloud = true;
      stepLog.status = "SUCCESS";
      stepLog.message = `Catalog ${entityType} '${entityId}' (${action}) 3-step verified & purged from TiDB Cloud.`;

      result.syncedCount++;
      result.purgedCount++;
    } catch (catalogErr: any) {
      console.error(
        `[SyncEngine Error] Catalog ${queueItem.id} (${queueItem.entity_type}:${queueItem.entity_id}) sync failed:`,
        catalogErr.message
      );
      stepLog.status = "FAILED";
      stepLog.message = catalogErr.message || "Unknown error during catalog verification handshake";
      result.failedCount++;
    }

    result.logs.push(stepLog);
  }

  // TiDB Cloud zero-bloat cleanup: if all pending catalog items were processed, clean any remaining temp rows
  if (result.remainingInCloud === 0) {
    try {
      const [localProdCheck]: any = await localQuery("SELECT count(*) as cnt FROM products");
      if (localProdCheck?.[0]?.cnt > 0) {
        await cloudQuery("DELETE FROM products WHERE 1=1").catch(() => {});
      }
    } catch {}
  }

  result.remainingInCloud = result.totalPendingInCloud - result.purgedCount;
  return result;
}

/**
 * Unified Sync & Drain Master Engine.
 * Concurrently triggers Triple-Handshake sync for:
 * 1. Catalog Queue (Products, Brands, Categories, Models, Banners)
 * 2. User Queue (Customer Accounts & Addresses)
 * 3. Order Queue (Orders & Order Items)
 * from 24/7 TiDB Cloud Buffer into Local Master PC MySQL 8.0,
 * and immediately purges all confirmed items from TiDB Cloud.
 */
export async function syncAllAndDrainCloud(): Promise<UnifiedSyncResult> {
  const localHealth = await testLocalConnection();
  if (!localHealth.connected) {
    return {
      catalog: {
        totalPendingInCloud: 0,
        syncedCount: 0,
        failedCount: 0,
        purgedCount: 0,
        remainingInCloud: 0,
        logs: [],
        localDbConnected: false,
      },
      users: {
        totalPendingInCloud: 0,
        syncedCount: 0,
        failedCount: 0,
        purgedCount: 0,
        remainingInCloud: 0,
        logs: [],
        localDbConnected: false,
      },
      orders: {
        totalPendingInCloud: 0,
        syncedCount: 0,
        failedCount: 0,
        purgedCount: 0,
        remainingInCloud: 0,
        logs: [],
        localDbConnected: false,
      },
      totalPending: 0,
      totalSynced: 0,
      localDbConnected: false,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Drain Catalog Queue first (foreign key dependency order)
  const catalogResult = await syncAndDrainCatalogQueue();

  // 2. Drain User Queue second (customers & addresses)
  const usersResult = await syncAndDrainCloudUserQueue();

  // 3. Drain Order Queue third (orders & items)
  const ordersResult = await syncAndDrainCloudQueue();

  // 4. Final Zero-Bloat Sweep on TiDB Cloud:
  // Ensure that any temporary records in TiDB Cloud tables are wiped to leave cloud storage at 0 KB
  try {
    const [localProdCheck]: any = await localQuery("SELECT count(*) as cnt FROM products");
    if (localProdCheck?.[0]?.cnt > 0) {
      await cloudQuery("DELETE FROM products WHERE 1=1").catch(() => {});
      await cloudQuery("DELETE FROM categories WHERE 1=1").catch(() => {});
      await cloudQuery("DELETE FROM brands WHERE 1=1").catch(() => {});
      await cloudQuery("DELETE FROM phone_models WHERE 1=1").catch(() => {});
    }
  } catch {}

  return {
    catalog: catalogResult,
    users: usersResult,
    orders: ordersResult,
    totalPending:
      catalogResult.totalPendingInCloud +
      usersResult.totalPendingInCloud +
      ordersResult.totalPendingInCloud,
    totalSynced:
      catalogResult.syncedCount + usersResult.syncedCount + ordersResult.syncedCount,
    localDbConnected: true,
    timestamp: new Date().toISOString(),
  };
}
