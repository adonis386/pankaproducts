import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { requireAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const auth = adminAuth();
    const result = await auth.listUsers(100);

    const admins = result.users
      .filter((u) => Boolean(u.customClaims?.admin))
      .map((u) => ({
        uid: u.uid,
        email: u.email || "",
        displayName: u.displayName || "",
        disabled: u.disabled,
        creationTime: u.metadata.creationTime,
        lastSignInTime: u.metadata.lastSignInTime,
      }));

    return NextResponse.json({ admins });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not authorized.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const caller = await requireAdminFromRequest(request);
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
      action?: "grant" | "create";
    };

    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const auth = adminAuth();
    let targetUser = await auth.getUserByEmail(email).catch(() => null);

    if (body.action === "create" || !targetUser) {
      if (!targetUser) {
        if (!body.password || body.password.length < 6) {
          return NextResponse.json(
            { error: "Password must be at least 6 characters for a new account." },
            { status: 400 }
          );
        }
        targetUser = await auth.createUser({
          email,
          password: body.password,
          displayName: body.displayName || "Admin",
          emailVerified: true,
        });
      } else if (body.password) {
        targetUser = await auth.updateUser(targetUser.uid, {
          password: body.password,
          displayName: body.displayName || targetUser.displayName,
          disabled: false,
        });
      }
    }

    await auth.setCustomUserClaims(targetUser.uid, {
      ...(targetUser.customClaims || {}),
      admin: true,
    });

    return NextResponse.json({
      ok: true,
      admin: {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set admin.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const caller = await requireAdminFromRequest(request);
    const body = (await request.json()) as { uid?: string };

    if (!body.uid) {
      return NextResponse.json({ error: "Missing uid." }, { status: 400 });
    }

    if (caller.uid === body.uid) {
      return NextResponse.json(
        { error: "You cannot revoke your own admin permissions." },
        { status: 400 }
      );
    }

    const auth = adminAuth();
    const user = await auth.getUser(body.uid);
    const claims = { ...(user.customClaims || {}) };
    delete claims.admin;
    await auth.setCustomUserClaims(body.uid, claims);

    return NextResponse.json({ ok: true, revokedUid: body.uid });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to revoke admin.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
