import { NextResponse } from "next/server";
import { testLocalConnection, testConnection, executeLocalTransaction, localQuery, cloudQuery, query } from "@/lib/db";
import { OrderPayload } from "@/lib/syncEngine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const orderData: OrderPayload = await request.json();

    if (!orderData || !orderData.id || !orderData.shippingAddress) {
      return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
    }

    const localHealth = await testLocalConnection();
    let savedToLocalDb = false;
    let savedToCloudQueue = false;

    if (localHealth.connected) {
      try {
        const rawItems = Array.isArray(orderData.items) ? orderData.items : [];
        const normalizedItems = rawItems.map((item: any) => ({
          productId: item.productId || item.product?.id || item.variantId || `prod-${Date.now()}`,
          productTitle: item.productTitle || item.product?.title || "Mobile Accessory",
          productImage:
            item.productImage ||
            item.image ||
            (Array.isArray(item.product?.images) ? item.product.images[0] : null) ||
            (Array.isArray(item.product?.imageUrls) ? item.product.imageUrls[0] : null) ||
            "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price ?? item.product?.basePrice ?? item.unitPrice) || 0,
          modelName: item.modelName || item.model?.name || undefined,
          color: item.selectedColor || item.color || undefined,
          storage: item.selectedStorage || item.storage || undefined,
        }));

        // Direct ACID write to local MySQL 8.0
        await executeLocalTransaction(async (conn) => {
          await conn.query(
            `INSERT INTO orders (
              id, order_number, user_id, customer_name, customer_email, customer_phone,
              shipping_address, items, pincode, payment_method, payment_status, order_status,
              tracking_number, total_amount, subtotal_amount, delivery_fee, discount_amount, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              order_status = VALUES(order_status),
              items = VALUES(items);`,
            [
              orderData.id,
              orderData.orderNumber || orderData.id,
              orderData.userId || null,
              orderData.shippingAddress.name,
              orderData.customerEmail,
              orderData.shippingAddress.phone,
              JSON.stringify(orderData.shippingAddress),
              JSON.stringify(normalizedItems),
              orderData.shippingAddress.pincode,
              orderData.paymentMethod || "cod",
              orderData.paymentStatus || "pending",
              (!orderData.orderStatus || orderData.orderStatus === "Order Placed") ? "Ordered" : orderData.orderStatus,
              orderData.trackingNumber || `TRACK-${Date.now().toString().slice(-6)}`,
              orderData.total,
              orderData.subtotal || orderData.total,
              orderData.deliveryFee || 0,
              orderData.discount || 0,
              new Date(),
            ]
          );

          if (normalizedItems.length > 0) {
            for (const item of normalizedItems) {
              const itemId = `item_${orderData.id}_${item.productId}_${Math.random().toString(36).slice(2, 7)}`;
              await conn.query(
                `INSERT INTO order_items (
                  id, order_id, product_id, product_title, model_name, color, storage, quantity, unit_price, total_price, image
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                  quantity = VALUES(quantity),
                  unit_price = VALUES(unit_price),
                  total_price = VALUES(total_price),
                  image = VALUES(image);`,
                [
                  itemId,
                  orderData.id,
                  item.productId,
                  item.productTitle,
                  item.modelName || null,
                  item.color || null,
                  item.storage || null,
                  item.quantity,
                  item.price,
                  item.price * item.quantity,
                  item.productImage,
                ]
              );
            }
          }
        });
        savedToLocalDb = true;
      } catch (dbErr: any) {
        console.warn(`[Order API] Direct DB write failed, falling back to cloud queue: ${dbErr.message}`);
      }
    }

    // If local DB was not reachable (e.g. PC is off / deployed to cloud), save to Cloud Queue Buffer
    if (!savedToLocalDb) {
      try {
        await cloudQuery(
          `INSERT INTO cloud_order_queue (id, order_number, order_payload)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE order_payload = VALUES(order_payload);`,
          [orderData.id, orderData.orderNumber || orderData.id, JSON.stringify(orderData)]
        );
        savedToCloudQueue = true;
      } catch (queueErr: any) {
        console.warn(`[Order API] Cloud queue buffer notice: ${queueErr?.message}`);
      }
    }

    // Dispatch Instant 24/7 Email Notification to PixKart Gmail
    try {
      const { sendOrderNotificationEmail } = await import("@/lib/emailService");
      await sendOrderNotificationEmail({
        orderId: orderData.id,
        customerName: orderData.shippingAddress.name,
        email: orderData.customerEmail,
        phone: orderData.shippingAddress.phone,
        address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`,
        pincode: orderData.shippingAddress.pincode,
        items: (orderData.items || []).map((item: any) => ({
          productTitle: item.productTitle || item.product?.title || "Mobile Accessory",
          quantity: item.quantity || 1,
          price: item.price || item.product?.basePrice || 0,
          modelName: item.modelName || item.model?.name,
        })),
        totalAmount: orderData.total,
        paymentMethod: orderData.paymentMethod || "Cash on Delivery (COD)",
        createdAt: orderData.createdAt,
      });
    } catch (e: any) {
      console.log("Email dispatch async note:", e.message);
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      savedToLocalDb,
      savedToCloudQueue,
      status: "CONFIRMED",
    });
  } catch (err: any) {
    console.error("[Order API Error]:", err);
    return NextResponse.json({ error: err?.message || "Order processing error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  const dbHealth = await testConnection();
  if (!dbHealth.connected) {
    return NextResponse.json({ orders: [], isConnected: false }, { headers: noCacheHeaders });
  }

  // Security Verification: If a customer email is specified, verify that the user still exists in MySQL
  if (email) {
    const cleanEmail = email.trim().toLowerCase();
    const [userRows]: any = await query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail]
    );

    if (!userRows || userRows.length === 0) {
      // User account was deleted from database
      return NextResponse.json(
        { error: "User account does not exist or has been deleted", orders: [], isConnected: true },
        { status: 401, headers: noCacheHeaders }
      );
    }
  }

  let sql = "SELECT * FROM orders";
  const params: any[] = [];

  if (email) {
    sql += " WHERE customer_email = ?";
    params.push(email.trim().toLowerCase());
  }

  sql += " ORDER BY created_at DESC LIMIT 100";

  try {
    const [orders]: any = await query(sql, params);
    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [], isConnected: true }, { headers: noCacheHeaders });
    }

    const orderIds = orders.map((o: any) => o.id);
    const itemsByOrderId: Record<string, any[]> = {};

    try {
      const [itemsRows]: any = await query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => "?").join(",")})`,
        orderIds
      );
      if (Array.isArray(itemsRows)) {
        for (const item of itemsRows) {
          if (!itemsByOrderId[item.order_id]) {
            itemsByOrderId[item.order_id] = [];
          }
          itemsByOrderId[item.order_id].push({
            productId: item.product_id,
            productTitle: item.product_title,
            productImage: item.image || "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80",
            quantity: Number(item.quantity) || 1,
            price: parseFloat(item.unit_price) || 0,
            modelName: item.model_name || undefined,
          });
        }
      }
    } catch (e: any) {
      console.warn("Could not batch-query order_items:", e.message);
    }

    const formattedOrders = orders.map((o: any) => {
      let parsedItems: any[] = [];
      if (o.items) {
        try {
          parsedItems = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
        } catch {}
      }

      const finalItems = (Array.isArray(parsedItems) && parsedItems.length > 0)
        ? parsedItems
        : (itemsByOrderId[o.id] || []);

      return {
        ...o,
        status: (o.order_status === "Order Placed" || o.status === "Order Placed" || !o.order_status)
          ? "Ordered"
          : (o.order_status || o.status || "Ordered"),
        customerName: o.customer_name || o.customerName || "Customer",
        totalAmount: o.total_amount !== undefined ? parseFloat(o.total_amount) : (o.totalAmount || 0),
        createdAt: o.created_at || o.createdAt || new Date().toISOString(),
        items: finalItems,
      };
    });

    return NextResponse.json({ orders: formattedOrders, isConnected: true }, { headers: noCacheHeaders });
  } catch (err: any) {
    return NextResponse.json({ orders: [], error: err.message, isConnected: false }, { headers: noCacheHeaders });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, orderStatus } = await request.json();
    if (!id || !orderStatus) {
      return NextResponse.json({ error: "Missing order id or orderStatus" }, { status: 400 });
    }
    await query("UPDATE orders SET order_status = ? WHERE id = ?", [orderStatus, id]);
    return NextResponse.json({ success: true, id, orderStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const clearAll = searchParams.get("clearAll");

    if (clearAll === "true") {
      await query("DELETE FROM order_items");
      await query("DELETE FROM orders");
      await query("DELETE FROM cloud_order_queue");
      return NextResponse.json(
        { success: true, message: "All orders permanently deleted" },
        { headers: noCacheHeaders }
      );
    }

    if (!id && !orderNumber) {
      return NextResponse.json(
        { error: "Missing order id or orderNumber" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    if (id) {
      await query("DELETE FROM order_items WHERE order_id = ?", [id]);
      await query("DELETE FROM orders WHERE id = ?", [id]);
      await query("DELETE FROM cloud_order_queue WHERE id = ?", [id]);
    } else if (orderNumber) {
      await query(
        "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number = ?)",
        [orderNumber]
      );
      await query("DELETE FROM orders WHERE order_number = ?", [orderNumber]);
      await query("DELETE FROM cloud_order_queue WHERE order_number = ?", [orderNumber]);
    }

    return NextResponse.json(
      { success: true, id, orderNumber, deleted: true },
      { headers: noCacheHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
