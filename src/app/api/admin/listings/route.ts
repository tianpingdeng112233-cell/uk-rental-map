import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const approveSchema = z.object({
  id: z.string(),
  action: z.enum(["approve", "reject"]),
  rejectReason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "需要管理员权限" } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = approveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "参数错误" } },
        { status: 400 }
      );
    }

    const { id, action, rejectReason } = parsed.data;

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        rejectReason: action === "reject" ? rejectReason : null,
      },
      include: { user: { select: { email: true, nickname: true } } },
    });

    // Send notification email
    if (listing.user?.email) {
      const subject =
        action === "approve"
          ? "你的房源已通过审核 - UK Rental Map"
          : "你的房源未通过审核 - UK Rental Map";
      const html =
        action === "approve"
          ? `<div style="font-family:Inter,sans-serif;padding:32px"><h2>你好，${listing.user.nickname}！</h2><p>你发布的房源 <strong>${listing.address}</strong> 已通过审核，现在可以在地图上看到了。</p></div>`
          : `<div style="font-family:Inter,sans-serif;padding:32px"><h2>你好，${listing.user.nickname}！</h2><p>很遗憾，你发布的房源 <strong>${listing.address}</strong> 未通过审核。</p><p>原因：${rejectReason || "不符合发布规范"}</p></div>`;

      await sendEmail({ to: listing.user.email, subject, html }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error("Admin listing action error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "操作失败" } },
      { status: 500 }
    );
  }
}
