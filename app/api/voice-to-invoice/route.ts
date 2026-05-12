import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are an invoice parser. Extract structured invoice data from natural language input.

RULES:
1. Output ONLY valid JSON. No markdown, no explanations.
2. All monetary values should be numbers (not strings with commas).
3. Currency defaults to INR if not specified.
4. Dates: use YYYY-MM-DD format. If relative ("in 15 days"), calculate from today.
5. GST/tax: if mentioned, extract the rate (e.g., "18% GST" → 18). If "plus GST" without rate, default to 18 for India.
6. Client name: extract the company or person name.
7. Line items: array of objects with {name, quantity, amount}. Quantity defaults to 1.
8. Invoice number: if not mentioned, return null.
9. Payment terms: if mentioned (e.g., "Net 15", "due in 30 days"), return as string.

OUTPUT SCHEMA:
{
  "invoice_number": string | null,
  "client_name": string,
  "client_email": string | null,
  "line_items": [
    { "name": string, "quantity": number, "amount": number }
  ],
  "subtotal": number,
  "tax_rate": number | null,
  "tax_amount": number,
  "total": number,
  "currency": "INR" | "USD" | "EUR" | "GBP",
  "due_date": string | null,
  "payment_terms": string | null,
  "notes": string | null
}`;

const schema = z.object({
  text: z.string().min(3).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 requests per minute per user/IP
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 20, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { text } = result.data;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "user", parts: [{ text: `Parse this invoice description: "${text}"` }] },
          ],
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || `Gemini API error: ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse Gemini response", raw: rawText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Voice to invoice error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
