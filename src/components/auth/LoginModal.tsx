"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || "登录失败");
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(email, password, nickname);
    if (result.success) {
      setSuccess("注册成功！请查收验证邮件后登录。");
      setTab("login");
    } else {
      setError(result.error || "注册失败");
    }
    setSubmitting(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(json.data.message);
      } else {
        setError(json.error?.message || "发送失败");
      }
    } catch {
      setError("网络错误");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-[400px] max-w-[90vw] p-6"
        style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.12)" }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#F2F4F6] text-[#434655]"
        >
          <X size={18} />
        </button>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div className="flex gap-1 mb-6 bg-[#F2F4F6] rounded-lg p-1">
            <button
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
                tab === "login"
                  ? "bg-white text-[#191C1E] shadow-sm"
                  : "text-[#434655]"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
                tab === "register"
                  ? "bg-white text-[#191C1E] shadow-sm"
                  : "text-[#434655]"
              }`}
            >
              注册
            </button>
          </div>
        )}

        {tab === "forgot" && (
          <h3 className="text-[18px] font-semibold text-[#191C1E] mb-4">
            重置密码
          </h3>
        )}

        {/* Error/Success messages */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#DC2626]/10 text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-[#059669]/10 text-[13px] text-[#059669]">
            {success}
          </div>
        )}

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              登录
            </button>
            <button
              type="button"
              onClick={() => { setTab("forgot"); setError(""); setSuccess(""); }}
              className="w-full text-center text-[12px] text-[#434655] hover:text-[#2563EB]"
            >
              忘记密码？
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="text"
                placeholder="昵称（2-20个字符）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                minLength={2}
                maxLength={20}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="password"
                placeholder="密码（8位以上，含字母和数字）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              注册
            </button>
            <p className="text-[11px] text-[#434655] text-center">
              注册即表示你同意我们的服务条款和隐私政策
            </p>
          </form>
        )}

        {/* Forgot Password Form */}
        {tab === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-3">
            <p className="text-[13px] text-[#434655] mb-2">
              输入你的注册邮箱，我们将发送重置密码的链接。
            </p>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C3C6D7]"
              />
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white border border-[#C3C6D7]/40 text-[14px] text-[#191C1E] placeholder-[#C3C6D7] focus:outline-none focus:border-[#2563EB]/40 focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              发送重置链接
            </button>
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className="w-full text-center text-[12px] text-[#434655] hover:text-[#2563EB]"
            >
              返回登录
            </button>
          </form>
        )}

        {/* Dev hint - only shown in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-3 border-t border-[#F2F4F6] text-[11px] text-[#C3C6D7] text-center">
            开发模式：demo@test.com / demo1234
          </div>
        )}
      </div>
    </div>
  );
}
