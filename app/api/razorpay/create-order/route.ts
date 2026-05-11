import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { planId, billing } = body as {
      planId: "pro" | "enterprise";
      billing: "monthly" | "yearly";
    };

    const prices: Record<string, Record<string, number>> = {
      pro: { monthly: 1499, yearly: 14990 },
      enterprise: { monthly: 3999, yearly: 39990 },
    };

    const amount = prices[planId]?.[billing];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan or billing" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `inv-sub-${Date.now()}`,
      notes: {
        planId,
        billing,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
