"use client";

import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      onClick={() => analytics.listingClick(listing.id)}
      className="flex gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
    >
      {/* Photo placeholder */}
      <div className="w-[88px] h-[66px] rounded-lg bg-surface-container-low shrink-0 overflow-hidden relative">
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.address}
            fill
            sizes="88px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline-variant">
            <MapPin size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[16px] font-bold text-primary">
            £{listing.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-on-surface-variant">/月</span>
        </div>

        {/* Address */}
        <p className="text-[12px] text-on-surface truncate mt-0.5">
          {listing.address}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-0.5">
            <Star size={11} className="text-star fill-star" />
            --
          </span>
          <span>{listing.roomType}</span>
          {listing.billsIncluded && (
            <span className="text-success">含账单</span>
          )}
        </div>
      </div>
    </Link>
  );
}
