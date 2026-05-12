import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Invoice } from "@/types/invoice";
import { substituteTemplateVars, buildHtmlEmail } from "@/lib/email";
import { z } from "zod";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const schema = z.object({
  to: z.string().email(),
  invoice: z.any(), // Invoice object - complex, validated at runtime
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  fromName: z.string().optional(),
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string().min(1),
    password: z.string().min(1),
    fromEmail: z.string().email(),
    fromName: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 50 emails per hour per user/IP (to prevent spam)
    const identifier = getClientIdentifier(req);
    const { success } = rateLimit(identifier, 50, 60 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many emails sent. Please try again later." },
        { status: 429 }
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

    const { to, invoice, subject, body: textBody, fromName, smtp } = result.data;

    const from = `${smtp.fromName || fromName || "Invoicy"} <${smtp.fromEmail}>`;

    const resolvedSubject = substituteTemplateVars(subject, invoice);
    const resolvedText = substituteTemplateVars(textBody, invoice);
    const html = buildHtmlEmail(resolvedSubject, resolvedText, invoice);

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: resolvedSubject,
      html,
      text: resolvedText,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
