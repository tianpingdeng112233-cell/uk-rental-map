"use client";

import { Star, User } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    transportScore: number;
    safetyScore: number;
    valueScore: number;
    overallScore: number;
    content: string;
    createdAt: string;
    user?: { nickname: string };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const avgScore = (
    (review.transportScore + review.safetyScore + review.valueScore + review.overallScore) / 4
  ).toFixed(1);

  return (
    <div className="py-4">
      {/* User info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F2F4F6] flex items-center justify-center">
            <User size={14} className="text-[#434655]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#191C1E]">
              {review.user?.nickname || "匿名用户"}
            </p>
            <p className="text-[11px] text-[#C3C6D7]">
              {new Date(review.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-[14px] font-semibold text-[#191C1E]">{avgScore}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-[13px] text-[#434655] leading-relaxed">{review.content}</p>
    </div>
  );
}
