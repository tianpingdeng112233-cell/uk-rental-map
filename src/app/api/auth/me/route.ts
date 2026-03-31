import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "未登录" } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      email: session.user.email,
      nickname: session.user.nickname,
      role: session.user.role,
    },
  });
}
