import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "MISSING_TOKEN", message: "缺少验证令牌" } },
      { status: 400 }
    );
  }

  try {
    const hashedToken = hashToken(token);
    const record = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.type !== "email_verify") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TOKEN", message: "无效的验证链接" } },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      return NextResponse.json(
        { success: false, error: { code: "EXPIRED_TOKEN", message: "验证链接已过期" } },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: record.email },
      data: { emailVerified: true },
    });

    // Delete the token
    await prisma.verificationToken.delete({ where: { id: record.id } });

    // Redirect to homepage with success message
    const redirectUrl = new URL("/", request.nextUrl.origin);
    redirectUrl.searchParams.set("verified", "true");
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "验证失败" } },
      { status: 500 }
    );
  }
}
