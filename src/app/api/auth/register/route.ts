import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendEmail, verificationEmailHtml } from "@/lib/email";
import { checkRateLimit, AUTH_RATE_LIMIT, getClientIP } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少8个字符")
    .regex(/[a-zA-Z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
  nickname: z.string().min(2, "昵称至少2个字符").max(20, "昵称最多20个字符"),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request);
  const rl = checkRateLimit(`register:${ip}`, AUTH_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: "请求过于频繁，请稍后重试" } },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { email, password, nickname } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "该邮箱已注册" },
        },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, nickname },
    });

    // Generate verification token
    const token = generateToken();
    await prisma.verificationToken.create({
      data: {
        token: hashToken(token),
        email,
        type: "email_verify",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // Send verification email
    await sendEmail({
      to: email,
      subject: "验证你的UK Rental Map账户",
      html: verificationEmailHtml(nickname, token),
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, nickname: user.nickname },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "注册失败，请稍后重试" },
      },
      { status: 500 }
    );
  }
}
