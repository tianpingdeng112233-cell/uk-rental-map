import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
      { status: 403 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      include: { user: { select: { nickname: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: reviews });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
      { status: 403 }
    );
  }

  try {
    const { id } = await request.json();
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "删除失败" } },
      { status: 500 }
    );
  }
}
