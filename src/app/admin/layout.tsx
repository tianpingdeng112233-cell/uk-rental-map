"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Database,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pending", icon: ClipboardCheck, label: "审核队列" },
  { href: "/admin/seed", icon: Database, label: "种子录入" },
  { href: "/admin/reviews", icon: MessageSquare, label: "评价管理" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data.role === "ADMIN") {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center text-[#434655]">
        加载中...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: "0 12px 32px rgba(15,23,42,0.06)" }}>
          <p className="text-[16px] font-semibold text-[#191C1E] mb-2">
            无权限访问
          </p>
          <p className="text-[13px] text-[#434655] mb-4">
            需要管理员权限才能访问此页面。
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[13px] font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      {/* Sidebar */}
      <aside className="w-[200px] bg-white shrink-0 flex flex-col border-r border-[#F2F4F6]">
        <div className="h-[56px] flex items-center px-4 border-b border-[#F2F4F6]">
          <span className="text-[14px] font-bold bg-gradient-to-r from-[#004AC6] to-[#2563EB] bg-clip-text text-transparent">
            管理后台
          </span>
        </div>

        <nav className="flex-1 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-[#004AC6] bg-[#004AC6]/5"
                    : "text-[#434655] hover:bg-[#F2F4F6]"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#F2F4F6]">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-[#434655] hover:text-[#004AC6]"
          >
            <ArrowLeft size={14} />
            返回前台
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
