import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Find messages that:
  // 1. Were sent more than 48 hours ago
  // 2. Haven't had a reminder sent yet
  // 3. The recipient hasn't read them (last_read < message created_at)
  const { data: unreadMessages } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      sender_id,
      conversation_id,
      reminder_sent_at,
      conversations (
        id,
        tenant_id,
        owner_id,
        tenant_last_read,
        owner_last_read,
        listings ( title, city )
      )
    `)
    .lt("created_at", fortyEightHoursAgo.toISOString())
    .is("reminder_sent_at", null);

  if (!unreadMessages || unreadMessages.length === 0) {
    return NextResponse.json({ message: "No unread messages to remind about" });
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

  let remindersSent = 0;
  const processedConversations = new Set<string>();

  for (const message of unreadMessages) {
    const conv = (Array.isArray(message.conversations)
      ? message.conversations[0]
      : message.conversations) as {
      id: string;
      tenant_id: string;
      owner_id: string;
      tenant_last_read: string | null;
      owner_last_read: string | null;
      listings: { title: string; city: string } | { title: string; city: string }[] | null;
    } | null;

    if (!conv) continue;

    // Skip if we already processed this conversation in this run
    if (processedConversations.has(conv.id)) continue;

    const listing = (Array.isArray(conv.listings) ? conv.listings[0] : conv.listings) as { title: string; city: string } | null;

    // Determine who the recipient is (not the sender)
    const recipientId = message.sender_id === conv.owner_id ? conv.tenant_id : conv.owner_id;
    const lastRead = recipientId === conv.owner_id ? conv.owner_last_read : conv.tenant_last_read;

    // Check if recipient has actually not read this message
    const messageTime = new Date(message.created_at).getTime();
    const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
    if (lastReadTime >= messageTime) continue; // Already read

    // Get recipient profile
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", recipientId)
      .single();

    if (!recipientProfile?.email) continue;

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", message.sender_id)
      .single();

    const senderName = senderProfile?.full_name || "Someone";
    const inboxUrl = `https://sub4u.vercel.app/inbox/${conv.id}`;

    await transporter.sendMail({
      from: `"Sub4U" <${process.env.GMAIL_USER}>`,
      to: recipientProfile.email,
      subject: `You have an unread message from ${senderName} — Sub4U`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0891b2;">You have an unread message 💬</h2>
          <p>Hi ${recipientProfile.full_name || "there"},</p>
          <p><strong>${senderName}</strong> sent you a message${listing ? ` about <strong>${listing.title}</strong> in ${listing.city}` : ""} 48 hours ago and you haven't seen it yet.</p>
          <div style="background: #f8fafc; border-left: 4px solid #0891b2; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #475569;">
            "${message.content.length > 100 ? message.content.slice(0, 100) + "..." : message.content}"
          </div>
          <a href="${inboxUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Read & Reply →
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
            You received this reminder because you have an unread message on Sub4U.
          </p>
        </div>
      `,
    });

    // Mark message reminder as sent
    await supabase
      .from("messages")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", message.id);

    processedConversations.add(conv.id);
    remindersSent++;
  }

  return NextResponse.json({
    message: `Sent ${remindersSent} reminder emails`,
  });
}