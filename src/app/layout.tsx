import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "UK Rental Map - 英国租房地图",
  description: "一张地图看清英国所有房源，真实评价帮你做出决策",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
