// Email sending via Resend API
// Falls back to console.log in development when RESEND_API_KEY is not set

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[DEV EMAIL] Body: ${html}`);
    return { success: true, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "UK Rental Map <noreply@ukrentalmap.com>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return { success: true };
}

export function verificationEmailHtml(nickname: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#191C1E">你好，${nickname}！</h2>
      <p style="color:#434655">请点击下方按钮验证你的邮箱地址：</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#004AC6,#2563EB);color:#fff;text-decoration:none;border-radius:8px;font-weight:600">验证邮箱</a>
      <p style="color:#434655;font-size:13px;margin-top:24px">如果你没有注册UK Rental Map，请忽略此邮件。</p>
    </div>
  `;
}

export function resetPasswordEmailHtml(token: string) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2 style="color:#191C1E">重置密码</h2>
      <p style="color:#434655">你收到此邮件是因为有人请求重置你的密码。点击下方按钮设置新密码：</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#004AC6,#2563EB);color:#fff;text-decoration:none;border-radius:8px;font-weight:600">重置密码</a>
      <p style="color:#434655;font-size:13px;margin-top:24px">此链接将在1小时后失效。如果你没有请求重置密码，请忽略此邮件。</p>
    </div>
  `;
}
