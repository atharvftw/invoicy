import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Invoice } from "@/types/invoice";
import { substituteTemplateVars, buildHtmlEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      invoice,
      subject,
      body: textBody,
      fromName,
      smtp,
    } = body as {
      to: string;
      invoice: Invoice;
      subject: string;
      body: string;
      fromName?: string;
      smtp: { host: string; port: number; secure: boolean; user: string; password: string; fromEmail: string; fromName: string };
    };

    if (!to || !invoice || !subject || !textBody || !smtp) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
