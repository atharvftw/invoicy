import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `You are an Indian GST tax classifier. For a given line item description, determine the correct GST rate and HSN/SAC code.

INDIAN GST RATES FOR COMMON SERVICES/GOODS:
- 0%: Fresh food, milk, curd, unbranded atta, unbranded maida, unbranded besan, eggs, honey, fruits, vegetables
- 5%: Transport services, economy class air tickets, small restaurants, oil, spices, tea, coffee
- 12%: Apparel above ₹1000, computers, diagnostic kits, exercise books, processed food
- 18%: IT services, software development, SaaS, cloud hosting, digital marketing, web design, consulting, accounting, legal, professional services, mobile phones, restaurant services (AC)
- 28%: Luxury goods, premium cars, tobacco, aerated drinks, 5-star hotel stays

OUTPUT: Return ONLY a JSON object with this exact schema:
{
  "gstRate": number,        // 0, 5, 12, 18, or 28
  "hsnCode": string | null,   // HSN for goods, null if clearly a service
  "sacCode": string | null,   // SAC for services, null if clearly a goods
  "category": string,         // e.g., "IT Services", "Professional Services", "Food & Beverages"
  "confidence": "high" | "medium" | "low",
  "reason": string            // brief explanation of why this rate was chosen
}

RULES:
- HSN codes are 4-8 digit codes for goods. SAC codes are 6 digit codes for services.
- For IT/software/consulting/design/hosting → 18% GST, SAC 9983xx or 9984xx
- For restaurants/food delivery → 5% or 18% depending on AC/non-AC
- If unsure, default to 18% with medium confidence
- Output only the JSON object, no markdown, no explanations.`;

const schema = z.object({
  description: z.string().min(3).max(500),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per user/IP
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 30, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
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

    const { description } = result.data;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
            { role: "user", parts: [{ text: `Classify this line item: "${description}"` }] },
          ],
          generationConfig: {
            maxOutputTokens: 256,
            temperature: 0.1,
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
    const jsonText = rawText.replace(/```json\n?|\n?```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "Failed to parse tax data", raw: rawText }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Tax intelligence error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
