import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotificationEmail, OrderEmailPayload } from "@/lib/emailService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload: OrderEmailPayload = await req.json();

    if (!payload.orderId || !payload.customerName || !payload.phone) {
      return NextResponse.json(
        { success: false, error: "Missing required order information." },
        { status: 400 }
      );
    }

    const result = await sendOrderNotificationEmail(payload);

    return NextResponse.json({
      success: true,
      orderId: payload.orderId,
      adminEmailNotification: result,
    });
  } catch (error: any) {
    console.error("[Order Notification API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
