"use client";

import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, openLoginModal } = useAuth();

  if (!user) {
    if (fallback) return <>{fallback}</>;
    return (
      <button
        onClick={openLoginModal}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
      >
        登录后操作
      </button>
    );
  }

  return <>{children}</>;
}
