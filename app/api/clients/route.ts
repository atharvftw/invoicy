import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, initDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// GET — list clients for current user
export async function GET() {
  await initDB();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await db.execute({
    sql: "SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC",
    args: [userId],
  });
  return NextResponse.json(result.rows);
}

// POST — create new client
export async function POST(req: Request) {
  await initDB();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.execute({
    sql: "INSERT INTO clients (id, user_id, name, email, address, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [id, userId, body.name, body.email ?? "", body.address ?? "", body.phone ?? "", now],
  });
  return NextResponse.json({ id, ...body, created_at: now });
}
