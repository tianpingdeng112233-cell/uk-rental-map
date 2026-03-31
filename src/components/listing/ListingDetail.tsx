"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Building,
  Phone,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ReviewScores from "@/components/review/ReviewScores";
import ReviewCard from "@/components/review/ReviewCard";
import ReviewForm from "@/components/review/ReviewForm";
import type { Listing, Review } from "@/types";

interface ListingDetailProps {
  listing: Listing & { city?: { name: string; nameEn: string } };
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const { user, openLoginModal } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [scores, setScores] = useState<{
    transport: number;
    safety: number;
    value: number;
    overall: number;
  } | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/reviews/location?lat=${listing.lat}&lng=${listing.lng}&radius=200`
      );
      const json = await res.json();
      if (json.success) {
        setReviews(json.data.reviews);
        setScores(json.data.averageScores);
        setTotalCount(json.data.totalCount);
      }
    } catch {
      // silently fail
    }
  }, [listing.lat, listing.lng]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const amenityList = listing.amenities || [];

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Top Nav */}
      <nav
        className="h-[56px] bg-white flex items-center px-4 gap-3"
        style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] text-[#004AC6] font-medium hover:underline"
        >
          <ArrowLeft size={16} />
          返回地图
        </Link>
        <div className="flex-1" />
        <span className="text-[14px] font-bold text-[#191C1E]">
          英国租房地图
        </span>
        <div className="flex-1" />
        <Link
          href={user ? "/publish" : "#"}
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              openLoginModal();
            }
          }}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white"
        >
          发布
        </Link>
      </nav>

      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left Column */}
          <div className="flex-1">
            {/* Photo */}
            <div className="w-full h-[280px] rounded-xl bg-[#F2F4F6] overflow-hidden mb-4">
              {listing.photos[0] ? (
                <img
                  src={listing.photos[0]}
                  alt={listing.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C3C6D7]">
                  <Building size={48} />
                </div>
              )}
            </div>

            {/* Price + Actions */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[32px] font-bold text-[#004AC6]">
                  £{listing.price.toLocaleString()}
                </span>
                <span className="text-[14px] text-[#434655] ml-1">/月</span>
                {listing.sourcePlatform && (
                  <span className="text-[11px] text-[#434655] ml-2">
                    来源: {listing.sourcePlatform}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-[#F2F4F6] text-[#434655]">
                  <Heart size={18} />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F2F4F6] text-[#434655]">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Address */}
            <h1 className="text-[18px] font-semibold text-[#191C1E]">
              {listing.address}
            </h1>
            {listing.buildingName && (
              <p className="text-[14px] text-[#434655] flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {listing.buildingName}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-[#F2F4F6] text-[12px] font-medium text-[#191C1E]">
                {listing.roomType}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F2F4F6] text-[12px] font-medium text-[#191C1E]">
                {listing.rentalType === "SHORT" ? "短租" : "长租"}
              </span>
              {listing.billsIncluded && (
                <span className="px-3 py-1 rounded-full bg-[#059669]/10 text-[12px] font-medium text-[#059669]">
                  含账单
                </span>
              )}
              {amenityList.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-full bg-[#F2F4F6] text-[12px] font-medium text-[#434655]"
                >
                  {a}
                </span>
              ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-white rounded-xl">
              {listing.availableFrom && (
                <div>
                  <p className="text-[11px] font-semibold text-[#434655] uppercase">
                    入住日期
                  </p>
                  <p className="text-[14px] text-[#191C1E] mt-0.5 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(listing.availableFrom).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              )}
              {listing.buildingName && (
                <div>
                  <p className="text-[11px] font-semibold text-[#434655] uppercase">
                    公寓
                  </p>
                  <p className="text-[14px] text-[#191C1E] mt-0.5">
                    {listing.buildingName}
                  </p>
                </div>
              )}
              {(listing.contactPhone ||
                listing.contactEmail ||
                listing.contactWechat) && (
                <div>
                  <p className="text-[11px] font-semibold text-[#434655] uppercase">
                    联系方式
                  </p>
                  <p className="text-[14px] text-[#191C1E] mt-0.5 flex items-center gap-1">
                    <Phone size={14} />
                    {listing.contactPhone ||
                      listing.contactEmail ||
                      listing.contactWechat}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-6">
                <h2 className="text-[16px] font-semibold text-[#191C1E] mb-2">
                  详细描述
                </h2>
                <p className="text-[14px] text-[#434655] leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Reviews */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white rounded-xl p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-[#191C1E]">
                  真实评价 ({totalCount})
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#6A1EDB]/10 text-[11px] font-semibold text-[#6A1EDB]">
                  AUTHENTIC
                </span>
              </div>

              <ReviewScores scores={scores} totalCount={totalCount} />

              <button
                onClick={() => {
                  if (!user) {
                    openLoginModal();
                  } else {
                    setShowReviewForm(true);
                  }
                }}
                className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Star size={14} />
                我住过这里，发表评价
              </button>

              {/* Reviews list */}
              {reviews.length > 0 ? (
                <div className="mt-4 divide-y divide-[#F2F4F6]">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 text-center py-8">
                  <p className="text-[13px] text-[#434655]">暂无评价</p>
                  <p className="text-[11px] text-[#C3C6D7] mt-1">
                    成为第一个评价者
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          lat={listing.lat}
          lng={listing.lng}
          address={listing.address}
          buildingName={listing.buildingName || undefined}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            fetchReviews();
          }}
        />
      )}
    </div>
  );
}
