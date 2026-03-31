"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { uploadPhoto, compressImage } from "@/lib/storage";
import { geocodeAddress } from "@/lib/geocode";
import type { City } from "@/types";

const ROOM_TYPES = ["Studio", "1bed", "2bed", "3bed", "4bed+"];
const AMENITY_OPTIONS = [
  "Furnished",
  "Bills Included",
  "Washer",
  "Dishwasher",
  "Gym",
  "Parking",
  "Garden",
  "Concierge",
  "Pool",
  "Bike Storage",
  "Rooftop",
  "Shared Kitchen",
  "Private Bath",
];

export default function PublishPage() {
  const { user, openLoginModal } = useAuth();
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("Studio");
  const [rentalType, setRentalType] = useState<"SHORT" | "LONG">("LONG");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [billsIncluded, setBillsIncluded] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWechat, setContactWechat] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCities(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      openLoginModal();
    }
  }, [user, openLoginModal]);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (photos.length + files.length > 6) {
      setError("最多上传6张照片");
      return;
    }
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const result = await uploadPhoto(compressed, path);
        if (result.success && result.url) {
          setPhotos((prev) => [...prev, result.url!]);
        } else {
          setError(result.error || "上传失败");
        }
      } catch {
        setError("照片上传失败");
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }

    setError("");
    setSubmitting(true);

    // Geocode address to get coordinates
    let lat: number;
    let lng: number;
    const geocodeResult = await geocodeAddress(address);
    if (geocodeResult) {
      lat = geocodeResult.lat;
      lng = geocodeResult.lng;
    } else {
      // Fallback to city center with small offset if geocoding fails
      const city = cities.find((c) => c.id === cityId);
      lat = city ? city.lat + (Math.random() - 0.5) * 0.02 : 51.5074;
      lng = city ? city.lng + (Math.random() - 0.5) * 0.02 : -0.1278;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          address,
          buildingName: buildingName || undefined,
          cityId,
          price: parseInt(price),
          roomType,
          rentalType,
          description: description || undefined,
          amenities,
          billsIncluded,
          photos,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          contactWechat: contactWechat || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error?.message || "发布失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-[400px]" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
          <div className="w-12 h-12 rounded-full bg-[#059669]/10 flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-[#059669]" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#191C1E] mb-2">发布成功！</h2>
          <p className="text-[14px] text-[#434655] mb-6">你的房源信息已提交，我们会在24小时内审核。审核通过后将显示在地图上。</p>
          <Link href="/" className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Top Nav */}
      <nav className="h-[56px] bg-white flex items-center px-4 gap-3" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-[#004AC6] font-medium hover:underline">
          <ArrowLeft size={16} />
          返回地图
        </Link>
        <div className="flex-1" />
        <span className="text-[14px] font-bold text-[#191C1E]">发布出租信息</span>
        <div className="flex-1" />
      </nav>

      <div className="max-w-[700px] mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#DC2626]/10 text-[13px] text-[#DC2626]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#191C1E]">位置信息</h3>
            <div>
              <label className="text-[12px] font-semibold text-[#434655] mb-1 block">城市 *</label>
              <select value={cityId} onChange={(e) => setCityId(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10">
                <option value="">选择城市</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.nameEn})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#434655] mb-1 block">详细地址 *</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="如: 123 Oxford Road, Manchester M1 5QS"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#434655] mb-1 block">公寓/小区名称</label>
              <input type="text" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="如: Vita Student"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
            </div>
          </div>

          {/* Listing Info */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#191C1E]">房源信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[#434655] mb-1 block">月租价格 (£) *</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={1} max={9999} placeholder="如: 800"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#434655] mb-1 block">房型 *</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10">
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#434655] mb-2 block">租期 *</label>
              <div className="flex gap-2">
                {(["SHORT", "LONG"] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setRentalType(type)}
                    className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${rentalType === type ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white" : "bg-[#F2F4F6] text-[#434655]"}`}>
                    {type === "SHORT" ? "短租 (≤6月)" : "长租 (>6月)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#434655] mb-1 block">描述</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} placeholder="描述你的房源特色、周边环境..."
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 resize-none" />
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl p-5 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#191C1E]">设施和标签</h3>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${amenities.includes(a) ? "bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white" : "bg-[#F2F4F6] text-[#434655] hover:bg-[#E8EAED]"}`}>
                  {a}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={billsIncluded} onChange={(e) => setBillsIncluded(e.target.checked)} className="rounded" />
              <span className="text-[13px] text-[#434655]">含账单 (Bills Included)</span>
            </label>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl p-5 space-y-3">
            <h3 className="text-[16px] font-semibold text-[#191C1E]">照片（最多6张）</h3>
            {/* Photo preview grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F2F4F6]">
                    <img src={url} alt={`照片${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 6 && (
              <label className="block border-2 border-dashed border-[#C3C6D7]/40 rounded-xl p-8 text-center cursor-pointer hover:border-[#2563EB]/40 transition-colors">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                  onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                {uploading ? (
                  <Loader2 size={32} className="mx-auto text-[#2563EB] mb-2 animate-spin" />
                ) : (
                  <Upload size={32} className="mx-auto text-[#C3C6D7] mb-2" />
                )}
                <p className="text-[13px] text-[#434655]">{uploading ? "上传中..." : "点击上传照片"}</p>
                <p className="text-[11px] text-[#C3C6D7] mt-1">支持 JPG, PNG, WebP，自动压缩至 500KB 以内</p>
              </label>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h3 className="text-[16px] font-semibold text-[#191C1E]">联系方式</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[#434655] mb-1 block">邮箱</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="email@example.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#434655] mb-1 block">电话</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+44 7xxx"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#434655] mb-1 block">微信</label>
                <input type="text" value={contactWechat} onChange={(e) => setContactWechat(e.target.value)} placeholder="微信号"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={18} className="animate-spin" />}
            提交发布
          </button>
          <p className="text-[12px] text-[#C3C6D7] text-center">
            提交后需要审核，通常在24小时内完成
          </p>
        </form>
      </div>
    </div>
  );
}
