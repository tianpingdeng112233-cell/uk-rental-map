import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const seedSchema = z.object({
  sourcePlatform: z.string().min(1, "请选择来源平台"),
  sourceUrl: z.string().url("请输入有效URL").optional().or(z.literal("")),
  price: z.number().int().min(1).max(9999),
  roomType: z.enum(["Studio", "1bed", "2bed", "3bed", "4bed+"]),
  rentalType: z.enum(["SHORT", "LONG"]),
  address: z.string().min(1, "请输入地址"),
  cityId: z.string().min(1, "请选择城市"),
  lat: z.number().optional(),
  lng: z.number().optional(),
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
    const parsed = seedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If no lat/lng, use city center with small offset
    let lat = data.lat;
    let lng = data.lng;
    if (!lat || !lng) {
      const city = await prisma.city.findUnique({ where: { id: data.cityId } });
      if (city) {
        lat = city.lat + (Math.random() - 0.5) * 0.02;
        lng = city.lng + (Math.random() - 0.5) * 0.02;
      } else {
        lat = 51.5074;
        lng = -0.1278;
      }
    }

    const listing = await prisma.listing.create({
      data: {
        lat,
        lng,
        address: data.address,
        cityId: data.cityId,
        price: data.price,
        roomType: data.roomType,
        rentalType: data.rentalType,
        source: "EDITORIAL",
        sourcePlatform: data.sourcePlatform,
        sourceUrl: data.sourceUrl || null,
        status: "APPROVED",
        amenities: [],
        photos: [],
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "录入失败" } },
      { status: 500 }
    );
  }
}
