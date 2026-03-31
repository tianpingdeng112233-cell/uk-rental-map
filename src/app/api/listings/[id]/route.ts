import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MOCK_LISTINGS } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { city: true },
    });

    if (listing) {
      return NextResponse.json({ success: true, data: listing });
    }
  } catch {
    // DB not available
  }

  // Fallback to mock data
  const mock = MOCK_LISTINGS.find((l) => l.id === id);
  if (!mock) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Listing not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: mock });
}
