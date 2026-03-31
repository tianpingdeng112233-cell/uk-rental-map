"use client";

import { useCallback } from "react";

interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceSlider({
  min,
  max,
  value,
  onChange,
}: PriceSliderProps) {
  const getPercent = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max]
  );

  return (
    <div>
      <div className="flex justify-between text-[11px] font-medium text-[#434655] mb-3">
        <span>£{value[0]}</span>
        <span>£{value[1] >= max ? `${max}+` : value[1]}</span>
      </div>
      <div className="relative h-1.5 bg-[#F2F4F6] rounded-full">
        <div
          className="absolute h-full bg-gradient-to-r from-[#004AC6] to-[#2563EB] rounded-full"
          style={{
            left: `${getPercent(value[0])}%`,
            width: `${getPercent(value[1]) - getPercent(value[0])}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={value[0]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < value[1]) onChange([v, value[1]]);
          }}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2563EB] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ top: 0 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={value[1]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > value[0]) onChange([value[0], v]);
          }}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2563EB] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ top: 0 }}
        />
      </div>
    </div>
  );
}
