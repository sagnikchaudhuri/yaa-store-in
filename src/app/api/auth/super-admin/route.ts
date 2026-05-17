// ─── Super Admin auth endpoint ────────────────────────────────────────────────
// Credentials are checked entirely server-side using non-NEXT_PUBLIC env vars.
// The password is NEVER sent to the client — only a success/failure signal
// plus the sanitised user object (no password field) on success.
//
// Environment variables required in .env.local:
//   DEMO_SUPER_ADMIN_EMAIL=your@email.com
//   DEMO_SUPER_ADMIN_PASSWORD=your_password
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const { email = "", password = "" } = body;

    const adminEmail    = process.env.DEMO_SUPER_ADMIN_EMAIL    ?? "";
    const adminPassword = process.env.DEMO_SUPER_ADMIN_PASSWORD ?? "";

    // Both env vars must be configured and credentials must match exactly.
    if (
      !adminEmail ||
      !adminPassword ||
      email.toLowerCase().trim() !== adminEmail.toLowerCase().trim() ||
      password !== adminPassword
    ) {
      // Return 401 with no detail — never hint which field was wrong.
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ Credentials match — return the sanitised user object.
    // The password is intentionally absent from this response.
    return NextResponse.json({
      ok: true,
      user: {
        id:       "sa0",
        name:     "Sagnik",
        email:    adminEmail,
        role:     "super-admin",
        status:   "active",
        joinedAt: "Jan 2024",
        lastSeen: "Just now",
        avatar:   "S",
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
