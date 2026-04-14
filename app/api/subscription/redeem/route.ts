import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  const validCode = process.env.PREMIUM_COUPON_CODE;

  if (!validCode || code?.trim().toUpperCase() !== validCode.toUpperCase()) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { plan: "premium" },
  });

  return NextResponse.json({ ok: true });
}
