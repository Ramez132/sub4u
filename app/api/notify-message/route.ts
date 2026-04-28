import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { toEmail, toName, fromName, listingTitle, message, conversationId } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const inboxUrl = `https://sub4u.vercel.app/inbox/${conversationId}`;

    await transporter.sendMail({
      from: `"Sub4U" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `New message from ${fromName} on Sub4U`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #f55a00;">New message on Sub4U 💬</h2>
          <p>Hi ${toName},</p>
          <p><strong>${fromName}</strong> sent you a message about <strong>${listingTitle}</strong>:</p>
          <div style="background: #f9f7f4; border-left: 4px solid #f55a00; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; color: #333;">"${message}"</p>
          </div>
          <a href="${inboxUrl}" style="display: inline-block; background: #f55a00; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Reply on Sub4U →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">You received this because someone messaged you on Sub4U.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}