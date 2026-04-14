import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";

// GET /api/invoices — list all invoices for the current user
export async function GET() {
  await initDB();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.execute({
    sql: "SELECT id, data, created_at, updated_at FROM invoices WHERE user_id = ? ORDER BY updated_at DESC",
    args: [userId],
  });

  const invoices = result.rows.map((row) => JSON.parse(row.data as string));
  return NextResponse.json(invoices);
}

// POST /api/invoices — create or upsert an invoice
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoice = await req.json();
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO invoices (id, user_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [invoice.id, userId, JSON.stringify(invoice), invoice.created_at || now, now],
  });

  return NextResponse.json({ ok: true });
}
