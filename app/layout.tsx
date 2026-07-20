import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treasure",
  description: "卡牌收藏管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
