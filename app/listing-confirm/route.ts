import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const response = searchParams.get("response");
  const token = searchParams.get("token");

  // Verify token
  if (token !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!listingId || !response) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const supabase = await createClient();

  if (response === "yes") {
    // Mark as confirmed — reset pending deletion
    await supabase
      .from("listings")
      .update({
        last_confirmed_at: new Date().toISOString(),
        pending_deletion: false,
      })
      .eq("id", listingId);

    return new NextResponse(`
      <html>
        <head><meta charset="utf-8"><title>Sub4U</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; max-width: 400px; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h2 style="color: #0891b2; margin-bottom: 8px;">Great!</h2>
            <p style="color: #64748b;">Your listing is still active on Sub4U. We'll check again next week.</p>
            <a href="https://sub4u.vercel.app/my-account" style="display: inline-block; margin-top: 24px; background: #0891b2; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 600;">
              View my listings
            </a>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }

  if (response === "no") {
    // Delete the listing
    await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    return new NextResponse(`
      <html>
        <head><meta charset="utf-8"><title>Sub4U</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; max-width: 400px; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
            <h2 style="color: #64748b; margin-bottom: 8px;">Listing removed</h2>
            <p style="color: #64748b;">Your listing has been removed from Sub4U. You can always create a new one.</p>
            <a href="https://sub4u.vercel.app/create-listing" style="display: inline-block; margin-top: 24px; background: #0891b2; color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 600;">
              Create a new listing
            </a>
          </div>
        </body>
      </html>
    `, { headers: { "Content-Type": "text/html" } });
  }

  return new NextResponse("Invalid response", { status: 400 });
}