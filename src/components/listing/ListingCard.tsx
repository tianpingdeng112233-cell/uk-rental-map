"use client";

import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex gap-3 p-3 rounded-xl hover:bg-[#F2F4F6] transition-colors group"
    >
      {/* Photo placeholder */}
      <div className="w-[88px] h-[66px] rounded-lg bg-[#F2F4F6] shrink-0 overflow-hidden">
        {listing.photos[0] ? (
          <img
            src={listing.photos[0]}
            alt={listing.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#C3C6D7]">
            <MapPin size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[16px] font-bold text-[#004AC6]">
            £{listing.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#434655]">/月</span>
        </div>

        {/* Address */}
        <p className="text-[12px] text-[#191C1E] truncate mt-0.5">
          {listing.address}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-[#434655]">
          <span className="flex items-center gap-0.5">
            <Star size={11} className="text-[#F59E0B] fill-[#F59E0B]" />
            4.0
          </span>
          <span>{listing.roomType}</span>
          {listing.billsIncluded && (
            <span className="text-[#059669]">含账单</span>
          )}
        </div>
      </div>
    </Link>
  );
}
