import nodemailer from "nodemailer";

export interface OrderEmailPayload {
  orderId: string;
  customerName: string;
  email?: string;
  phone: string;
  address: string;
  pincode: string;
  items: Array<{
    productId?: string;
    productTitle?: string;
    productImage?: string;
    quantity: number;
    price: number;
    modelName?: string;
    product?: { title: string; basePrice: number };
  }>;
  totalAmount: number;
  paymentMethod?: string;
  createdAt?: string;
}

export async function sendOrderNotificationEmail(payload: OrderEmailPayload) {
  const {
    orderId,
    customerName,
    email: customerEmail,
    phone,
    address,
    pincode,
    items = [],
    totalAmount = 0,
    paymentMethod = "Cash on Delivery (COD)",
    createdAt = new Date().toISOString(),
  } = payload;

  const adminEmail = process.env.ADMIN_EMAIL || "pixkartofficial@gmail.com";
  const gmailUser = process.env.GMAIL_USER || adminEmail;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD;
  const resendApiKey = process.env.RESEND_API_KEY;

  const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  // Build items HTML table
  const itemsTableHtml = items
    .map((item) => {
      const title = item.productTitle || item.product?.title || "Mobile Accessory";
      const price = item.price || item.product?.basePrice || 0;
      const qty = item.quantity || 1;
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; font-size: 13px; color: #1e293b;">
            <strong style="color: #0f172a;">${title}</strong>
            ${item.modelName ? `<br/><span style="font-size: 11px; color: #64748b;">For Model: ${item.modelName}</span>` : ""}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 13px; font-weight: bold; color: #334155;">
            ${qty}
          </td>
          <td style="padding: 10px 8px; text-align: right; font-size: 13px; font-family: monospace; font-weight: 600; color: #0f172a;">
            ₹${price}
          </td>
          <td style="padding: 10px 8px; text-align: right; font-size: 13px; font-family: monospace; font-weight: bold; color: #1d4ed8;">
            ₹${price * qty}
          </td>
        </tr>
      `;
    })
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New PixKart Order #${orderId}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #2874f0 0%, #1d4ed8 100%); padding: 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; background-color: #ff9f00; color: #000000; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 6px; font-style: italic; letter-spacing: 1px; margin-bottom: 8px;">
            PIXKART EXPRESS
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">🎉 New Order Received!</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #dbeafe;">Order ID: <strong>#${orderId}</strong> | ${formattedDate}</p>
        </div>

        <div style="padding: 20px 24px;">
          <!-- Customer & Delivery Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Customer & Delivery Details</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">👤 ${customerName}</p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #334155;">📞 Phone: <strong>${phone}</strong></p>
            ${customerEmail ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #334155;">✉️ Email: <strong>${customerEmail}</strong></p>` : ""}
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #334155;">📍 Delivery Address: ${address}</p>
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1d4ed8;">📮 Delivery Pincode: ${pincode} (Udupi Local Express)</p>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsTableHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 14px; color: #0f172a;">Total (COD):</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: 900; font-size: 16px; color: #1d4ed8; font-family: monospace;">${formattedTotal}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; text-align: center; margin-top: 16px;">
            <span style="color: #065f46; font-weight: bold; font-size: 13px;">Payment Mode: 💵 Cash on Delivery (COD)</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let sent = false;
  let errorMsg: string | null = null;

  // Option 1: Send via Resend REST API (100% Free, Zero 2FA configuration needed)
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey.trim()}`,
        },
        body: JSON.stringify({
          from: "PixKart Orders <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `🛒 New Order #${orderId} Received! - ${formattedTotal} (COD)`,
          html: emailHtml,
        }),
      });

      if (res.ok) {
        sent = true;
        console.log(`[EmailService] ✓ Order email successfully dispatched via Resend API to ${adminEmail}`);
      } else {
        const resData = await res.json();
        errorMsg = resData?.message || "Resend dispatch failed";
        console.warn(`[EmailService] Resend API error:`, resData);
      }
    } catch (err: any) {
      console.error("[EmailService] Resend dispatch exception:", err);
      errorMsg = err?.message;
    }
  }

  // Option 2: Send via Gmail SMTP (Nodemailer)
  if (!sent && gmailAppPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser.trim(),
          pass: gmailAppPassword.trim().replace(/\s+/g, ""),
        },
      });

      await transporter.sendMail({
        from: `"PixKart Orders" <${gmailUser.trim()}>`,
        to: adminEmail,
        subject: `🛒 New Order #${orderId} Received! - ${formattedTotal} (COD)`,
        html: emailHtml,
      });

      if (customerEmail && customerEmail.includes("@") && customerEmail !== adminEmail) {
        try {
          await transporter.sendMail({
            from: `"PixKart Official" <${gmailUser.trim()}>`,
            to: customerEmail,
            subject: `✓ Order Confirmed! PixKart Order #${orderId}`,
            html: emailHtml,
          });
        } catch {}
      }

      sent = true;
      console.log(`[EmailService] ✓ Order email successfully dispatched via Gmail SMTP to ${adminEmail}`);
    } catch (err: any) {
      console.error("[EmailService] Error sending Gmail alert:", err);
      errorMsg = err?.message || "Failed to dispatch Gmail";
    }
  }

  // Fallback: Console simulator
  if (!sent && !gmailAppPassword && !resendApiKey) {
    console.log(`\n======================================================`);
    console.log(`[PIXKART ORDER EMAIL DISPATCH READY]`);
    console.log(`To Admin:     ${adminEmail}`);
    if (customerEmail) console.log(`To Customer:  ${customerEmail}`);
    console.log(`Order ID:     #${orderId}`);
    console.log(`Customer:     ${customerName} (${phone})`);
    console.log(`Address:      ${address} - ${pincode}`);
    console.log(`Total:        ${formattedTotal} (Cash on Delivery)`);
    console.log(`Items Count:  ${items.length}`);
    console.log(`======================================================\n`);
  }

  return { sent, error: errorMsg, recipient: adminEmail };
}
