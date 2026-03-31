"use client";

import Link from "next/link";
import { MapPin, Star, PlusCircle, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { analytics } from "@/lib/analytics";
import type { City } from "@/types";

interface NavbarProps {
  cities: City[];
  activeCityId: string | null;
  onCitySelect: (cityId: string | null) => void;
}

export default function Navbar({
  cities,
  activeCityId,
  onCitySelect,
}: NavbarProps) {
  const { user, openLoginModal, logout } = useAuth();

  return (
    <nav
      className="h-[56px] bg-white flex items-center px-4 gap-3 z-50 relative"
      style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
    >
      {/* Logo */}
      <button
        onClick={() => onCitySelect(null)}
        className="flex items-center gap-1.5 shrink-0 mr-2"
      >
        <span className="text-[15px] font-bold bg-gradient-to-r from-[#004AC6] to-[#2563EB] bg-clip-text text-transparent">
          英国租房地图
        </span>
      </button>

      {/* City buttons */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => {
              const newCityId = activeCityId === city.id ? null : city.id;
              onCitySelect(newCityId);
              if (newCityId) analytics.citySelect(city.nameEn);
            }}
            className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeCityId === city.id
                ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white"
                : "text-[#434655] hover:bg-[#F2F4F6]"
            }`}
          >
            {city.nameEn}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <button className="p-2 rounded-lg text-[#434655] hover:bg-[#F2F4F6] transition-colors">
          <Star size={18} />
        </button>
        <button className="p-2 rounded-lg text-[#434655] hover:bg-[#F2F4F6] transition-colors">
          <MapPin size={18} />
        </button>
        <Link
          href={user ? "/publish" : "#"}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              openLoginModal();
            }
          }}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <PlusCircle size={14} />
          发布
        </Link>
        {user ? (
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-[#434655] font-medium px-2">
              {user.nickname}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[#434655] hover:bg-[#F2F4F6] transition-colors"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[#C3C6D7] text-[#191C1E] hover:bg-[#F2F4F6] transition-colors flex items-center gap-1.5"
          >
            <User size={14} />
            登录
          </button>
        )}
      </div>
    </nav>
  );
}
