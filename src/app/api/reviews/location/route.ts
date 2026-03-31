import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") || "0");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") || "0");
  const radius = parseFloat(request.nextUrl.searchParams.get("radius") || "200");

  // Approximate degrees for radius in meters (1 degree ~ 111km)
  const latDelta = radius / 111000;
  const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180));

  try {
    const reviews = await prisma.review.findMany({
      where: {
        lat: { gte: lat - latDelta, lte: lat + latDelta },
        lng: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      include: { user: { select: { nickname: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalCount = reviews.length;
    const averageScores =
      totalCount > 0
        ? {
            transport: +(reviews.reduce((s, r) => s + r.transportScore, 0) / totalCount).toFixed(1),
            safety: +(reviews.reduce((s, r) => s + r.safetyScore, 0) / totalCount).toFixed(1),
            value: +(reviews.reduce((s, r) => s + r.valueScore, 0) / totalCount).toFixed(1),
            overall: +(reviews.reduce((s, r) => s + r.overallScore, 0) / totalCount).toFixed(1),
          }
        : null;

    return NextResponse.json({
      success: true,
      data: { averageScores, totalCount, reviews },
    });
  } catch {
    // DB not available - return empty
    return NextResponse.json({
      success: true,
      data: { averageScores: null, totalCount: 0, reviews: [] },
    });
  }
}
