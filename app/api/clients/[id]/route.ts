import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.execute({
    sql: "DELETE FROM clients WHERE id = ? AND user_id = ?",
    args: [params.id, userId],
  });
  return NextResponse.json({ ok: true });
}
