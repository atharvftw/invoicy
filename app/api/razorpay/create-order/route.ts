import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const schema = z.object({
  planId: z.enum(["pro", "enterprise"]),
  billing: z.enum(["monthly", "yearly"]),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 order creation attempts per minute per user/IP
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 5, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many order attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { planId, billing } = result.data;

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
