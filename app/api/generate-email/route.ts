import { NextRequest, NextResponse } from "next/server";
import { Invoice, EmailTone } from "@/types/invoice";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

const TONE_PROMPTS: Record<EmailTone, string> = {
  professional:
    "Write a formal, respectful payment reminder email. Use polished business language, proper salutations, and a courteous but clear call to action. Avoid contractions.",
  casual:
    "Write a relaxed, warm payment reminder email. Use conversational language as if talking to a friend. Light, approachable tone. Use contractions and simple sentences.",
  firm:
    "Write a direct, assertive payment reminder email. Be clear about the urgency. No apologies. State expectations plainly. Professional but uncompromising.",
  friendly:
    "Write a cheerful, approachable payment reminder email. Warm greeting, positive framing, gentle nudge. Make the client feel valued while reminding them.",
  urgent:
    "Write a serious, time-sensitive payment reminder email. Emphasize deadlines and consequences. Professional but convey that immediate action is required.",
};

function buildPrompt(
  tone: EmailTone,
  invoice: Invoice,
  context?: {
    riskScore?: number;
    avgDaysLate?: number;
    isVIP?: boolean;
    daysOverdue?: number;
  }
): string {
  const base = TONE_PROMPTS[tone];
  const items = invoice.items
    .map((i) => `- ${i.name}: ${i.quantity} x ${i.amount} = ${i.quantity * i.amount}`)
    .join("\n");

  const behavioralContext = context
    ? `
CLIENT BEHAVIORAL CONTEXT:
- Risk Score: ${context.riskScore ?? "unknown"}/100 (higher = more likely to delay)
- Average Days Late: ${context.avgDaysLate ?? "unknown"}
- VIP Status: ${context.isVIP ? "Yes — treat with extra respect and flexibility" : "No"}
- Days Overdue (current invoice): ${context.daysOverdue ?? "not overdue"}
${context.daysOverdue && context.daysOverdue > 14 ? "- This is a chronic late payer. Escalate firmly but keep it professional." : ""}
${context.isVIP ? "- This is a VIP client. Be respectful, offer payment plan options, avoid harsh language." : ""}`
    : "";

  return `${base}

INVOICE CONTEXT:
- Invoice Number: ${invoice.invoice_number || "Draft"}
- Client Name: ${invoice.bill_to.name || "Valued Client"}
- Business Name: ${invoice.from.name || "Your Business"}
- Total Amount: ${invoice.currency} ${invoice.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
- Balance Due: ${invoice.currency} ${invoice.balance_due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
- Due Date: ${invoice.due_date || "N/A"}
- Invoice Date: ${invoice.date}
- Line Items:
${items}
${behavioralContext}

INSTRUCTIONS:
1. Generate ONLY a subject line and email body.
2. Do NOT include any explanations, markdown formatting, or extra text.
3. Output format must be exactly:
SUBJECT: <subject line>
BODY:
<email body>
4. Keep the email concise (under 150 words).
5. Include a payment reference or invoice number.
6. End with a sign-off from the business name.
7. Do not use emojis unless the tone is casual.
8. Use "{client_name}", "{invoice_number}", "{total}", "{due_date}", "{balance_due}", "{currency}" as template variables where appropriate.`;
}

const schema = z.object({
  invoice: z.any(), // Invoice object - complex, validated at runtime
  tone: z.enum(["professional", "casual", "firm", "friendly", "urgent"]),
  context: z.object({
    riskScore: z.number().min(0).max(100).optional(),
    avgDaysLate: z.number().optional(),
    isVIP: z.boolean().optional(),
    daysOverdue: z.number().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 25 requests per minute per user/IP
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 25, 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured on server" }, { status: 500 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { invoice, tone, context } = result.data;

    if (!invoice || !tone) {
      return NextResponse.json({ error: "Missing invoice or tone" }, { status: 400 });
    }

    const prompt = buildPrompt(tone, invoice, context);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.7,
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse SUBJECT: and BODY:
    const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = text.match(/BODY:\s*([\s\S]*)/i);

    const subject = subjectMatch?.[1]?.trim() || `Reminder: Invoice #${invoice.invoice_number}`;
    const emailBody = bodyMatch?.[1]?.trim() || text;

    return NextResponse.json({ success: true, subject, body: emailBody });
  } catch (err) {
    console.error("Generate email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
