import Image from "next/image";

type PhotoFrameSize = "small" | "large";

interface PhotoFrameProps {
  src?: string;
  alt: string;
  size?: PhotoFrameSize;
}

const SIZE_MAP: Record<PhotoFrameSize, number> = {
  small: 100,
  large: 220,
};

// 固定 5:7(卡牌實際比例)並用 aspect-ratio 而不是寫死的像素高度,
// 這樣不管在什麼螢幕寬度打開分享連結,照片永遠是正確的直式比例、不會被裁切。
// 圓角刻意用 2px(博物館畫框風),跟其他 UI 元件的 8px 圓角形成對比。
export function PhotoFrame({ src, alt, size = "large" }: PhotoFrameProps) {
  const width = SIZE_MAP[size];

  return (
    <div
      style={{
        width,
        aspectRatio: "var(--aspect-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-frame)",
        overflow: "hidden",
        background: "var(--color-surface-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={Math.round((width * 7) / 5)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>無照片</span>
      )}
    </div>
  );
}
