import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 verification attempts per minute per user/IP
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 10, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 }
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = result.data;

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Signature verified — payment is authentic
    // In production, also verify order amount via Razorpay API before updating user
    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
