import { NextResponse } from "next/server";
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
    const listings = await prisma.listing.findMany({
      where: { status: "PENDING" },
      include: { city: true, user: { select: { nickname: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: listings });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
