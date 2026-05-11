import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

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
