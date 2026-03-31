import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MOCK_CITIES } from "@/lib/mock-data";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
    });
    if (cities.length > 0) {
      return NextResponse.json({ success: true, data: cities });
    }
  } catch {
    // DB not available, use mock data
  }
  return NextResponse.json({ success: true, data: MOCK_CITIES });
}
