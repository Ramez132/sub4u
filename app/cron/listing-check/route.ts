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
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Step 1: Delete listings that are pending deletion AND were sent confirmation 2+ weeks ago
  const { data: toDelete } = await supabase
    .from("listings")
    .select("id, title, user_id")
    .eq("pending_deletion", true)
    .lt("confirmation_sent_at", twoWeeksAgo.toISOString());

  if (toDelete && toDelete.length > 0) {
    for (const listing of toDelete) {
      await supabase.from("listings").delete().eq("id", listing.id);
    }
  }

  // Step 2: Mark listings as pending_deletion if confirmation was sent 1+ week ago and not confirmed
  await supabase
    .from("listings")
    .update({ pending_deletion: true })
    .lt("confirmation_sent_at", oneWeekAgo.toISOString())
    .lt("last_confirmed_at", oneWeekAgo.toISOString())
    .not("confirmation_sent_at", "is", null);

  // Step 3: Send confirmation emails to all active listings not confirmed in the last week
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, city, user_id, last_confirmed_at, confirmation_sent_at")
    .eq("pending_deletion", false)
    .or(`confirmation_sent_at.is.null,confirmation_sent_at.lt.${oneWeekAgo.toISOString()}`);

  if (!listings || listings.length === 0) {
    return NextResponse.json({ message: "No listings to process" });
  }

  // Get owner emails
  const userIds = [...new Set(listings.map((l) => l.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  let emailsSent = 0;

  for (const listing of listings) {
    const profile = profileMap[listing.user_id];
    if (!profile?.email) continue;

    const baseUrl = "https://sub4u.vercel.app";
    const yesUrl = `${baseUrl}/api/listing-confirm?listingId=${listing.id}&response=yes&token=${process.env.CRON_SECRET}`;
    const noUrl = `${baseUrl}/api/listing-confirm?listingId=${listing.id}&response=no&token=${process.env.CRON_SECRET}`;

    await transporter.sendMail({
      from: `"Sub4U" <${process.env.GMAIL_USER}>`,
      to: profile.email,
      subject: `Is your listing still available? — ${listing.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0891b2;">Weekly listing check — Sub4U 🏠</h2>
          <p>Hi ${profile.full_name || "there"},</p>
          <p>Your listing <strong>${listing.title}</strong> in ${listing.city} is still active on Sub4U.</p>
          <p>Is it still available for rent?</p>
          <div style="margin: 24px 0; display: flex; gap: 12px;">
            <a href="${yesUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 28px; border-radius: 100px; text-decoration: none; font-weight: 600; margin-right: 12px;">
              ✅ Yes, still available
            </a>
            <a href="${noUrl}" style="display: inline-block; background: #f1f5f9; color: #334155; padding: 12px 28px; border-radius: 100px; text-decoration: none; font-weight: 600;">
              ❌ No, remove it
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            If you don't respond, we'll send another reminder next week. 
            If you don't respond for 2 weeks in a row, the listing will be automatically removed.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Sub4U — Find your next sublet, simply and quickly.</p>
        </div>
      `,
    });

    // Update confirmation_sent_at
    await supabase
      .from("listings")
      .update({ confirmation_sent_at: now.toISOString() })
      .eq("id", listing.id);

    emailsSent++;
  }

  return NextResponse.json({
    message: `Processed ${listings.length} listings, sent ${emailsSent} emails, deleted ${toDelete?.length ?? 0} listings`,
  });
}