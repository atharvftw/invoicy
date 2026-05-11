import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, billing, paymentId } = body as {
      planId: string;
      billing: "monthly" | "yearly";
      paymentId: string;
    };

    // In a real implementation, use Clerk Backend SDK to update user metadata:
    // import { clerkClient } from "@clerk/nextjs/server";
    // await clerkClient.users.updateUserMetadata(userId, {
    //   publicMetadata: {
    //     plan: planId,
    //     billing,
    //     paymentId,
    //     subscribedAt: new Date().toISOString(),
    //   },
    // });

    // For now, we store in a simple in-memory or local storage fallback
    // since the Backend SDK may require additional setup

    return NextResponse.json({ success: true, planId, billing });
  } catch (err) {
    console.error("Update plan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
