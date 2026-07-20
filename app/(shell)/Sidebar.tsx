"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "我的收藏" },
  { href: "/cards/new", label: "新增卡片" },
  { href: "/lots", label: "群組管理" },
  { href: "/tags", label: "標籤管理" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: "1px solid var(--color-border)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: "100vh",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-voice)",
          fontSize: 18,
          color: "var(--color-text-primary)",
          textDecoration: "none",
          margin: "0 8px 20px 8px",
        }}
      >
        Treasure
      </Link>
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              padding: "8px",
              borderRadius: "var(--radius-ui)",
              textDecoration: "none",
              color: isActive ? "var(--color-accent-text)" : "var(--color-text-secondary)",
              background: isActive ? "var(--color-accent-bg)" : "transparent",
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
