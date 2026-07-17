import type { Metadata } from "next";
import Link from "next/link";
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
      <body>
        <header style={{ borderBottom: "1px solid var(--color-border)", padding: "16px 24px" }}>
          <Link
            href="/"
            style={{ fontFamily: "var(--font-voice)", fontSize: 18, color: "var(--color-text-primary)", textDecoration: "none" }}
          >
            Treasure
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
