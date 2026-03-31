"use client";

import { RotateCcw } from "lucide-react";
import PriceSlider from "./PriceSlider";
import type { FilterState } from "@/types";

const ROOM_TYPES = ["All", "Studio", "1bed", "2bed", "3bed+"];
const RENTAL_TYPES = ["All", "Short", "Long"];

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
}: FilterPanelProps) {
  const update = (partial: Partial<FilterState>) =>
    onFilterChange({ ...filters, ...partial });

  const reset = () =>
    onFilterChange({
      cityId: filters.cityId,
      minPrice: 0,
      maxPrice: 5000,
      roomType: null,
      rentalType: null,
    });

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-[14px] font-semibold text-[#191C1E]">筛选条件</h3>

      {/* Price Range */}
      <div>
        <label className="text-[11px] font-semibold text-[#434655] uppercase tracking-wide">
          月租价格 (£/月)
        </label>
        <div className="mt-2">
          <PriceSlider
            min={0}
            max={5000}
            value={[filters.minPrice, filters.maxPrice]}
            onChange={([minPrice, maxPrice]) => update({ minPrice, maxPrice })}
          />
        </div>
      </div>

      {/* Room Type */}
      <div>
        <label className="text-[11px] font-semibold text-[#434655] uppercase tracking-wide">
          房型
        </label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ROOM_TYPES.map((type) => {
            const isActive =
              type === "All" ? !filters.roomType : filters.roomType === type;
            return (
              <button
                key={type}
                onClick={() =>
                  update({ roomType: type === "All" ? null : type })
                }
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white"
                    : "bg-[#F2F4F6] text-[#434655] hover:bg-[#E8EAED]"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rental Type */}
      <div>
        <label className="text-[11px] font-semibold text-[#434655] uppercase tracking-wide">
          租期
        </label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {RENTAL_TYPES.map((type) => {
            const value = type === "Short" ? "SHORT" : type === "Long" ? "LONG" : null;
            const isActive =
              type === "All" ? !filters.rentalType : filters.rentalType === value;
            return (
              <button
                key={type}
                onClick={() => update({ rentalType: value })}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white"
                    : "bg-[#F2F4F6] text-[#434655] hover:bg-[#E8EAED]"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={reset}
          className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[#434655] bg-[#F2F4F6] hover:bg-[#E8EAED] transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={14} />
          重置
        </button>
        <button className="flex-1 py-2 rounded-lg text-[13px] font-medium bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white hover:opacity-90 transition-opacity">
          应用筛选
        </button>
      </div>
    </div>
  );
}
