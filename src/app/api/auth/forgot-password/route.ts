import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "请输入有效的邮箱" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, data: { message: "如果该邮箱已注册，你将收到重置密码的邮件" } });
    }

    // Delete existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email: parsed.data.email, type: "password_reset" },
    });

    // Generate new token
    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        token: hashToken(token),
        email: parsed.data.email,
        type: "password_reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendEmail({
      to: parsed.data.email,
      subject: "重置你的UK Rental Map密码",
      html: resetPasswordEmailHtml(token),
    });

    return NextResponse.json({ success: true, data: { message: "如果该邮箱已注册，你将收到重置密码的邮件" } });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "发送失败，请稍后重试" } },
      { status: 500 }
    );
  }
}
