import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const portalUser = await prisma.portalUser.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        isActive: true,
        shipperId: true,
        companyId: true,
      },
    });

    if (!portalUser || !portalUser.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (portalUser.passwordHash) {
      const [salt, storedHash] = portalUser.passwordHash.split(":");
      if (!salt || !storedHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const hash = crypto.scryptSync(password, salt, 64).toString("hex");
      if (hash !== storedHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    await prisma.portalUser.update({
      where: { id: portalUser.id },
      data: { lastLoginAt: new Date() },
    });

    const cookieStore = await cookies();
    cookieStore.set("portal_email", portalUser.email, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({
      success: true,
      user: { name: portalUser.name, email: portalUser.email },
    });
  } catch (error) {
    console.error("Portal auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
