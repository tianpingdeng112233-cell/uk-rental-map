import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const reviewSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1),
  buildingName: z.string().optional(),
  transportScore: z.number().int().min(1).max(5),
  safetyScore: z.number().int().min(1).max(5),
  valueScore: z.number().int().min(1).max(5),
  overallScore: z.number().int().min(1).max(5),
  content: z.string().min(10, "评价至少10个字符").max(500, "评价最多500个字符"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "请先登录" } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
      include: { user: { select: { nickname: true } } },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE", message: "你已经评价过这个地址了" } },
        { status: 409 }
      );
    }
    console.error("Review create error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "提交失败" } },
      { status: 500 }
    );
  }
}
