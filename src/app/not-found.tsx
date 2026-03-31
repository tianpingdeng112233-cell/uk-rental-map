import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[48px] font-bold text-[#191C1E]">404</h1>
        <p className="text-[14px] text-[#434655] mt-2">页面未找到</p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#004AC6] to-[#2563EB] text-white text-[13px] font-medium"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
