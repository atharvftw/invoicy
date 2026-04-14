import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// DELETE /api/invoices/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await getDb().execute({
    sql: "DELETE FROM invoices WHERE id = ? AND user_id = ?",
    args: [params.id, userId],
  });

  return NextResponse.json({ ok: true });
}

// GET /api/invoices/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getDb().execute({
    sql: "SELECT data FROM invoices WHERE id = ? AND user_id = ?",
    args: [params.id, userId],
  });

  if (result.rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(result.rows[0].data as string));
}
