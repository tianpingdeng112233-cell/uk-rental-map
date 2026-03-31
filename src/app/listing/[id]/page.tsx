import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import ListingDetail from "@/components/listing/ListingDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { city: true },
    });
    if (listing && listing.status === "APPROVED") {
      return JSON.parse(JSON.stringify(listing));
    }
  } catch {
    // DB not available
  }
  // Fallback to mock
  return MOCK_LISTINGS.find((l) => l.id === id) || null;
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();
  return <ListingDetail listing={listing} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "房源未找到 - UK Rental Map" };
  return {
    title: `£${listing.price}/月 ${listing.roomType} ${listing.address} - UK Rental Map`,
    description: listing.description || `${listing.address} - ${listing.roomType}`,
  };
}
