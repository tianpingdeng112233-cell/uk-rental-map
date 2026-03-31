"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Home, Users, MessageSquare } from "lucide-react";

interface Stats {
  pendingCount: number;
  totalListings: number;
  totalUsers: number;
  totalReviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStats(json.data);
      })
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "待审核",
      value: stats?.pendingCount ?? "--",
      icon: ClipboardCheck,
      color: "#D97706",
      bg: "#D97706",
    },
    {
      label: "总房源",
      value: stats?.totalListings ?? "--",
      icon: Home,
      color: "#004AC6",
      bg: "#004AC6",
    },
    {
      label: "总用户",
      value: stats?.totalUsers ?? "--",
      icon: Users,
      color: "#059669",
      bg: "#059669",
    },
    {
      label: "总评价",
      value: stats?.totalReviews ?? "--",
      icon: MessageSquare,
      color: "#6A1EDB",
      bg: "#6A1EDB",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-[#191C1E] mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5"
            style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold text-[#434655] uppercase">
                {card.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.bg}10` }}
              >
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-[28px] font-bold text-[#191C1E]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
