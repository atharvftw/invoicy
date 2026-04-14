import { NextResponse } from "next/server";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const userId = event.payload?.payment?.entity?.notes?.userId as string;
    if (userId) {
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        publicMetadata: { plan: "premium" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
