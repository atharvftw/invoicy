import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { substituteTemplateVars, buildHtmlEmail } from "@/lib/email";
import { Invoice } from "@/types/invoice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, invoice, subject, body: textBody, fromName } = body as {
      to: string;
      invoice: Invoice;
      subject: string;
      body: string;
      fromName?: string;
    };

    if (!to || !invoice || !subject || !textBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    const resolvedSubject = substituteTemplateVars(subject, invoice);
    const resolvedText = substituteTemplateVars(textBody, invoice);
    const html = buildHtmlEmail(resolvedSubject, resolvedText, invoice);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: resolvedSubject,
      html,
      text: resolvedText,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Send reminder error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
