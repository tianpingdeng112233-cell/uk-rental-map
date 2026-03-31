"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, Star } from "lucide-react";

interface AdminReview {
  id: string;
  address: string;
  transportScore: number;
  safetyScore: number;
  valueScore: number;
  overallScore: number;
  content: string;
  createdAt: string;
  user?: { nickname: string; email: string };
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((json) => { if (json.success) setReviews(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条评价？")) return;
    setDeletingId(id);
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-[#191C1E] mb-6">评价管理</h1>

      {loading ? (
        <div className="text-center py-12 text-[#434655]">加载中...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <p className="text-[14px] text-[#434655]">暂无评价</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const avg = ((r.transportScore + r.safetyScore + r.valueScore + r.overallScore) / 4).toFixed(1);
            return (
              <div key={r.id} className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Star size={14} className="text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-[14px] font-semibold text-[#191C1E]">{avg}</span>
                      <span className="text-[12px] text-[#434655]">{r.address}</span>
                    </div>
                    <p className="text-[13px] text-[#434655] line-clamp-2">{r.content}</p>
                    <p className="text-[11px] text-[#C3C6D7] mt-1">
                      {r.user?.nickname} ({r.user?.email}) · {new Date(r.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                    className="p-2 rounded-lg hover:bg-[#DC2626]/10 text-[#DC2626] disabled:opacity-50">
                    {deletingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
