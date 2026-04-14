import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb, initDB } from "@/lib/db";

const MAX_BODY_BYTES = 512 * 1024; // 512 KB

// GET /api/invoices — list all invoices for the current user
export async function GET() {
  await initDB();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getDb().execute({
    sql: "SELECT id, data, created_at, updated_at FROM invoices WHERE user_id = ? ORDER BY updated_at DESC",
    args: [userId],
  });

  const invoices = result.rows.flatMap((row) => {
    try { return [JSON.parse(row.data as string)]; } catch { return []; }
  });
  return NextResponse.json(invoices);
}

// POST /api/invoices — create or upsert an invoice
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const invoice = await req.json().catch(() => null);
  if (!invoice || typeof invoice.id !== "string") {
    return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });
  }

  const now = new Date().toISOString();

  await getDb().execute({
    sql: `INSERT INTO invoices (id, user_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [invoice.id, userId, JSON.stringify(invoice), invoice.created_at || now, now],
  });

  return NextResponse.json({ ok: true });
}
