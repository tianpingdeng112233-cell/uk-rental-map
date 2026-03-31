"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error?.message || "重置失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-[400px]" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
          <p className="text-[14px] text-[#DC2626]">无效的重置链接</p>
          <Link href="/" className="inline-block mt-4 text-[13px] text-[#004AC6] hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-[400px]" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
          <CheckCircle size={32} className="text-[#059669] mx-auto mb-3" />
          <h2 className="text-[18px] font-semibold text-[#191C1E] mb-2">密码重置成功</h2>
          <p className="text-[14px] text-[#434655] mb-4">你可以使用新密码登录了。</p>
          <Link href="/" className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold">
            返回首页登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-[400px] max-w-[90vw]" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
        <h2 className="text-[18px] font-semibold text-[#191C1E] mb-4">设置新密码</h2>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#DC2626]/10 text-[13px] text-[#DC2626]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]" />
            <input type="password" placeholder="新密码（8位以上，含字母和数字）" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]" />
            <input type="password" placeholder="确认新密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            重置密码
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center"><Loader2 className="animate-spin text-[#434655]" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
