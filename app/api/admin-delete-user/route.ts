import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

const ADMIN_ID = "ec1ad54f-66cf-4ee0-b8d6-14b7107725e5";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, reason } = await req.json();
  if (!userId || !reason) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Fetch user profile before deleting
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Save to deleted_users table
  await supabase.from("deleted_users").insert({
    user_id: userId,
    email: profile.email,
    full_name: profile.full_name,
    phone_number: profile.phone_number,
    reason,
  });

  // Delete all user's listings
  await supabase.from("listings").delete().eq("user_id", userId);

  // Delete user profile
  await supabase.from("profiles").delete().eq("id", userId);

  // Send email to deleted user
  if (profile.email) {
    try {
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
        from: `"Sub4U" <${process.env.GMAIL_USER}>`,
        to: profile.email,
        subject: "Your Sub4U account has been removed",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Sub4U Account Notice</h2>
            <p>Hi ${profile.full_name || "there"},</p>
            <p>Your Sub4U account has been removed by our team.</p>
            <div style="background: #f8fafc; border-left: 4px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin: 16px 0; color: #475569;">
              <strong>Reason:</strong> ${reason}
            </div>
            <p>If you believe this was a mistake, please contact us by replying to this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">Sub4U Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send deletion email:", err);
    }
  }

  return NextResponse.json({ success: true });
}