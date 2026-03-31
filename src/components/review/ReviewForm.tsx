"use client";

import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ReviewFormProps {
  lat: number;
  lng: number;
  address: string;
  buildingName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-[#434655]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={20}
              className={
                star <= value
                  ? "text-[#F59E0B] fill-[#F59E0B]"
                  : "text-[#C3C6D7]"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewForm({
  lat,
  lng,
  address,
  buildingName,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const { user, openLoginModal } = useAuth();
  const [transportScore, setTransportScore] = useState(0);
  const [safetyScore, setSafetyScore] = useState(0);
  const [valueScore, setValueScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl w-[440px] max-w-[90vw] p-6" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}>
          <p className="text-center text-[14px] text-[#434655] mb-4">请先登录后再发表评价</p>
          <button onClick={() => { onClose(); openLoginModal(); }}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold">
            去登录
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportScore || !safetyScore || !valueScore || !overallScore) {
      setError("请为所有维度打分");
      return;
    }
    if (content.length < 10) {
      setError("评价至少10个字符");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat, lng, address, buildingName,
          transportScore, safetyScore, valueScore, overallScore, content,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onSuccess();
      } else {
        setError(json.error?.message || "提交失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-[440px] max-w-[90vw] p-6" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#F2F4F6] text-[#434655]">
          <X size={18} />
        </button>

        <h3 className="text-[18px] font-semibold text-[#191C1E] mb-1">发表评价</h3>
        <p className="text-[13px] text-[#434655] mb-4">{address}</p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#DC2626]/10 text-[13px] text-[#DC2626]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 p-4 bg-[#F7F9FB] rounded-xl">
            <StarRating label="交通便利" value={transportScore} onChange={setTransportScore} />
            <StarRating label="安全程度" value={safetyScore} onChange={setSafetyScore} />
            <StarRating label="性价比" value={valueScore} onChange={setValueScore} />
            <StarRating label="总体评价" value={overallScore} onChange={setOverallScore} />
          </div>

          <div>
            <textarea
              placeholder="分享你的真实居住体验（10-500字）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 resize-none transition-all"
            />
            <p className="text-[11px] text-[#C3C6D7] text-right mt-1">{content.length}/500</p>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            提交评价
          </button>
        </form>
      </div>
    </div>
  );
}
