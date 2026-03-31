import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

const schema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "密码至少8个字符")
    .regex(/[a-zA-Z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const hashedToken = hashToken(parsed.data.token);
    const record = await prisma.verificationToken.findUnique({
      where: { token: hashedToken },
    });

    if (!record || record.type !== "password_reset") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TOKEN", message: "无效的重置链接" } },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      return NextResponse.json(
        { success: false, error: { code: "EXPIRED_TOKEN", message: "重置链接已过期" } },
        { status: 400 }
      );
    }

    const passwordHash = await hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { email: record.email },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true, data: { message: "密码重置成功" } });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "重置失败" } },
      { status: 500 }
    );
  }
}
