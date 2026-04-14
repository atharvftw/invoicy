import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// In-memory rate limit: 5 attempts per userId per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit check
  const now = Date.now();
  const bucket = attempts.get(userId);
  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }
    bucket.count++;
  } else {
    attempts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const validCode = process.env.PREMIUM_COUPON_CODE;

  if (!code || !validCode || code.toUpperCase() !== validCode.toUpperCase()) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  }

  // Clear rate limit on success
  attempts.delete(userId);

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { plan: "premium" },
  });

  return NextResponse.json({ ok: true });
}
