import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listingQuerySchema } from "@/lib/validators";
import { filterMockListings } from "@/lib/mock-data";

const createListingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1, "请输入地址"),
  buildingName: z.string().optional(),
  cityId: z.string(),
  price: z.number().int().min(1, "价格必须大于0").max(9999),
  roomType: z.enum(["Studio", "1bed", "2bed", "3bed", "4bed+"]),
  rentalType: z.enum(["SHORT", "LONG"]),
  availableFrom: z.string().optional(),
  description: z.string().max(2000).optional(),
  amenities: z.array(z.string()).default([]),
  billsIncluded: z.boolean().default(false),
  photos: z.array(z.string()).default([]),
  contactWechat: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
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
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,
        availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
        source: "USER",
        status: "PENDING",
        userId: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "发布失败" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = listingQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { cityId, minPrice, maxPrice, roomType, rentalType, page, limit } = parsed.data;

  try {
    // Auto-archive expired listings (90-day check)
    await prisma.listing.updateMany({
      where: {
        status: "APPROVED",
        expiresAt: { lt: new Date() },
      },
      data: { status: "ARCHIVED" },
    }).catch(() => {});

    const where: Record<string, unknown> = { status: "APPROVED" };
    if (cityId) where.cityId = cityId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }
    if (roomType) where.roomType = roomType;
    if (rentalType) where.rentalType = rentalType;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { city: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ]);

    if (total > 0 || listings.length > 0) {
      return NextResponse.json({
        success: true,
        data: listings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }
  } catch {
    // DB not available
  }

  const filtered = filterMockListings({ cityId, minPrice, maxPrice, roomType, rentalType });
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);
  return NextResponse.json({
    success: true,
    data: paged,
    pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
  });
}
