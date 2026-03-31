"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2, ExternalLink } from "lucide-react";
import type { Listing } from "@/types";

export default function PendingPage() {
  const [listings, setListings] = useState<(Listing & { user?: { nickname: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPending = async () => {
    const res = await fetch("/api/admin/pending");
    const json = await res.json();
    if (json.success) setListings(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject", reason?: string) => {
    setActionId(id);
    const res = await fetch("/api/admin/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, rejectReason: reason }),
    });
    const json = await res.json();
    if (json.success) {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
    setActionId(null);
    setRejectId(null);
    setRejectReason("");
  };

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-[#191C1E] mb-6">审核队列</h1>

      {loading ? (
        <div className="text-center py-12 text-[#434655]">加载中...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <p className="text-[14px] text-[#434655]">暂无待审核房源</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[16px] font-bold text-[#004AC6]">£{l.price}/月</span>
                    <span className="text-[12px] text-[#434655]">{l.roomType}</span>
                    <span className="text-[12px] text-[#434655]">{l.rentalType === "SHORT" ? "短租" : "长租"}</span>
                  </div>
                  <p className="text-[13px] text-[#191C1E] truncate">{l.address}</p>
                  {l.user && (
                    <p className="text-[11px] text-[#C3C6D7] mt-1">
                      发布者: {l.user.nickname} ({l.user.email})
                    </p>
                  )}
                  <p className="text-[11px] text-[#C3C6D7]">
                    提交时间: {new Date(l.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {l.sourceUrl && (
                    <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-[#F2F4F6] text-[#434655]">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {rejectId === l.id ? (
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="拒绝理由" value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border border-[#C3C6D7]/40 text-[12px] w-[160px]" />
                      <button onClick={() => handleAction(l.id, "reject", rejectReason)}
                        disabled={actionId === l.id}
                        className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-[12px] font-medium disabled:opacity-50">
                        {actionId === l.id ? <Loader2 size={14} className="animate-spin" /> : "确认拒绝"}
                      </button>
                      <button onClick={() => setRejectId(null)}
                        className="px-2 py-1.5 rounded-lg text-[12px] text-[#434655] hover:bg-[#F2F4F6]">
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleAction(l.id, "approve")}
                        disabled={actionId === l.id}
                        className="px-3 py-1.5 rounded-lg bg-[#059669] text-white text-[12px] font-medium disabled:opacity-50 flex items-center gap-1">
                        {actionId === l.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} />通过</>}
                      </button>
                      <button onClick={() => setRejectId(l.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-[12px] font-medium flex items-center gap-1">
                        <X size={14} />拒绝
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
