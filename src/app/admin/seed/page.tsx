"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import type { City } from "@/types";

const PLATFORMS = ["Rightmove", "Zoopla", "SpareRoom", "OpenRent", "其他"];
const ROOM_TYPES = ["Studio", "1bed", "2bed", "3bed", "4bed+"];

export default function SeedPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [sourcePlatform, setSourcePlatform] = useState("Rightmove");
  const [sourceUrl, setSourceUrl] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("Studio");
  const [rentalType, setRentalType] = useState<"SHORT" | "LONG">("LONG");
  const [address, setAddress] = useState("");
  const [cityId, setCityId] = useState("");

  useEffect(() => {
    fetch("/api/cities").then((r) => r.json()).then((json) => {
      if (json.success) setCities(json.data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePlatform,
          sourceUrl: sourceUrl || undefined,
          price: parseInt(price),
          roomType,
          rentalType,
          address,
          cityId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setSourceUrl("");
        setPrice("");
        setAddress("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error?.message || "录入失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-[20px] font-semibold text-[#191C1E] mb-6">种子数据录入</h1>

      <div className="bg-white rounded-xl p-5 max-w-[700px]" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        {error && <div className="mb-4 px-3 py-2 rounded-lg bg-[#DC2626]/10 text-[13px] text-[#DC2626]">{error}</div>}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#059669]/10 text-[13px] text-[#059669] flex items-center gap-1.5">
            <CheckCircle size={14} />录入成功！房源已自动审核通过。
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">来源平台 *</label>
              <select value={sourcePlatform} onChange={(e) => setSourcePlatform(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">城市 *</label>
              <select value={cityId} onChange={(e) => setCityId(e.target.value)} required
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]">
                <option value="">选择</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">价格 (£/月) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={1}
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">房型 *</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]">
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">地址 *</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="完整地址"
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#434655] mb-1 block">来源链接</label>
              <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..."
                className="w-full px-2 py-2 rounded-lg border border-[#C3C6D7]/40 text-[13px]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["LONG", "SHORT"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setRentalType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${rentalType === t ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white" : "bg-[#F2F4F6] text-[#434655]"}`}>
                  {t === "SHORT" ? "短租" : "长租"}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button type="submit" disabled={submitting}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[13px] font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              录入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
