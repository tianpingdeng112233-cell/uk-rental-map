import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <nav className="h-[56px] bg-white flex items-center px-4" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-[#004AC6] font-medium hover:underline">
          <ArrowLeft size={16} />返回
        </Link>
        <span className="flex-1 text-center text-[14px] font-bold text-[#191C1E]">隐私政策</span>
        <div className="w-[60px]" />
      </nav>

      <div className="max-w-[700px] mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-6 space-y-6" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div>
            <h1 className="text-[24px] font-bold text-[#191C1E] mb-2">隐私政策</h1>
            <p className="text-[13px] text-[#C3C6D7]">最后更新：2026年3月31日</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">1. 信息收集</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">我们收集你在使用UK Rental Map时主动提供的信息，包括：注册时的邮箱地址和昵称；发布房源时的地址和联系方式；提交的评价内容。我们还会自动收集基本的使用数据，如页面浏览和功能使用情况。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">2. 信息使用</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">我们使用收集的信息用于：提供和改进服务；发送账户相关通知（验证邮件、审核结果）；分析使用模式以优化产品体验。我们不会将你的个人信息出售给第三方。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">3. 数据存储与安全</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">你的数据存储在受保护的PostgreSQL数据库中（由Supabase托管）。密码使用bcrypt加密存储，全站强制HTTPS传输。我们采取合理的技术措施保护你的数据安全。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">4. Cookie</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">我们使用必要的Cookie来维持你的登录状态（httpOnly JWT）。不使用第三方追踪Cookie。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">5. 你的权利</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">根据GDPR，你有权：访问你的个人数据；要求更正不准确的数据；要求删除你的数据；撤回同意。如需行使上述权利，请通过邮件联系我们。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[#191C1E]">6. 联系我们</h2>
            <p className="text-[14px] text-[#434655] leading-relaxed">如有任何隐私相关问题，请发送邮件至 privacy@ukrentalmap.com。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
