"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import FilterPanel from "@/components/filter/FilterPanel";
import ListingCard from "@/components/listing/ListingCard";
import type { City, Listing, FilterState, MapBounds } from "@/types";
import { MapPin } from "lucide-react";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#F2F4F6] flex items-center justify-center text-[#434655]">
      地图加载中...
    </div>
  ),
});

export default function HomePage() {
  const [cities, setCities] = useState<City[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    cityId: null,
    minPrice: 0,
    maxPrice: 5000,
    roomType: null,
    rentalType: null,
  });
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch cities on mount
  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCities(json.data);
      })
      .catch(() => {});
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.cityId) params.set("cityId", filters.cityId);
      if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice < 5000) params.set("maxPrice", String(filters.maxPrice));
      if (filters.roomType) params.set("roomType", filters.roomType);
      if (filters.rentalType) params.set("rentalType", filters.rentalType);
      params.set("limit", "50");

      try {
        const res = await fetch(`/api/listings?${params}`);
        const json = await res.json();
        if (json.success) setListings(json.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [filters]);

  // Filter listings within visible map bounds
  const visibleListings = useMemo(() => {
    if (!bounds) return listings;
    return listings.filter(
      (l) =>
        l.lat >= bounds.south &&
        l.lat <= bounds.north &&
        l.lng >= bounds.west &&
        l.lng <= bounds.east
    );
  }, [listings, bounds]);

  const handleCitySelect = useCallback(
    (cityId: string | null) => {
      setFilters((prev) => ({ ...prev, cityId }));
    },
    []
  );

  const handleBoundsChange = useCallback((newBounds: MapBounds) => {
    setBounds(newBounds);
  }, []);

  const handleMarkerClick = useCallback((listingId: string) => {
    window.open(`/listing/${listingId}`, "_blank");
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar
        cities={cities}
        activeCityId={filters.cityId}
        onCitySelect={handleCitySelect}
      />

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Left Sidebar - hidden on mobile when map is showing */}
        <aside className="w-full md:w-[320px] shrink-0 bg-white flex flex-col overflow-hidden border-r border-[#F2F4F6] max-h-[40vh] md:max-h-none">
          {/* Filter Panel */}
          <FilterPanel filters={filters} onFilterChange={setFilters} />

          {/* Listing count */}
          <div className="px-4 py-2 border-t border-[#F2F4F6]">
            <p className="text-[11px] font-semibold text-[#434655] uppercase tracking-wide">
              当前区域房源 ({visibleListings.length})
            </p>
          </div>

          {/* Listing List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-[13px] text-[#434655]">
                加载中...
              </div>
            ) : visibleListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-[13px] text-[#434655]">
                <MapPin size={24} className="mb-2 text-[#C3C6D7]" />
                暂无房源
              </div>
            ) : (
              visibleListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          {/* Bottom status */}
          <div className="px-4 py-2 text-center border-t border-[#F2F4F6]">
            <p className="text-[11px] text-[#434655]">
              共显示 {visibleListings.length} 套房源
              {filters.cityId && cities.find((c) => c.id === filters.cityId)
                ? ` · ${cities.find((c) => c.id === filters.cityId)!.nameEn}`
                : ""}
            </p>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          <MapContainer
            cities={cities}
            activeCityId={filters.cityId}
            filters={filters}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
          />
        </main>
      </div>
    </div>
  );
}
