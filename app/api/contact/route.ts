import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Sub4U Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New contact message from ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0891b2;">New contact message — Sub4U</h2>
          <p><strong>From:</strong> ${email}</p>
          <div style="background: #f8fafc; border-left: 4px solid #0891b2; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #334155; white-space: pre-wrap;">
${message}
          </div>
          <p style="color: #94a3b8; font-size: 12px;">Sent via Sub4U contact form. Reply directly to this email to respond.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}