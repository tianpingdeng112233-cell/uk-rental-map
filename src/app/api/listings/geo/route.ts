import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listingGeoQuerySchema } from "@/lib/validators";
import { getMockListingGeo } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);

  const parsed = listingGeoQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { cityId, minPrice, maxPrice, roomType, rentalType } = parsed.data;

  try {
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

    const listings = await prisma.listing.findMany({
      where,
      select: { id: true, lat: true, lng: true, price: true, roomType: true, rentalType: true },
    });

    if (listings.length > 0) {
      return NextResponse.json({ success: true, data: listings });
    }
  } catch {
    // DB not available
  }

  // Fallback to mock data
  return NextResponse.json({
    success: true,
    data: getMockListingGeo({ cityId, minPrice, maxPrice, roomType, rentalType }),
  });
}
