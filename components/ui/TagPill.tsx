import { ReactNode } from "react";

interface TagPillProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

// 一張卡可以同時掛上多個不同維度的 TagPill(系列/用途/鑑定狀態...),
// 對應資料庫的 TAG_DIMENSIONS + TAGS 彈性結構,不是單選分類。
export function TagPill({ children, selected = false, onClick }: TagPillProps) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-ui)",
        fontSize: 12,
        borderRadius: 999,
        padding: "3px 10px",
        cursor: onClick ? "pointer" : "default",
        border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
        color: selected ? "var(--color-accent-text)" : "var(--color-text-secondary)",
        background: "transparent",
      }}
    >
      {children}
    </span>
  );
}

// 「新增標籤」用虛線邊框跟一般標籤區隔開,一眼看出這是動作按鈕不是既有標籤。
export function AddTagPill({ onClick }: { onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "var(--font-ui)",
        fontSize: 12,
        borderRadius: 999,
        padding: "3px 10px",
        cursor: "pointer",
        border: "1px dashed var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      + 新增標籤
    </span>
  );
}
