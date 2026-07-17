import { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

// 同一個畫面最多只能出現一個 primary 按鈕——這是刻意的節制,
// 讓琥珀金強調色維持稀有性,才不會整頁按鈕都在搶注意力。
export function Button({ variant = "secondary", children, style, ...props }: ButtonProps) {
  const base: CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: "var(--radius-ui)",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 120ms ease, transform 80ms ease",
  };

  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: "var(--color-accent)",
      color: "#2E1F0A",
      border: "none",
    },
    secondary: {
      background: "transparent",
      color: "var(--color-accent-text)",
      border: "1px solid var(--color-accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
      border: "none",
    },
  };

  return (
    <button {...props} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}
