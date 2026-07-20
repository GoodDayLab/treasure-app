import { ImageResponse } from "next/og";
import { getShareableCard } from "@/lib/data";

const IMAGE_WIDTH = 1080;
const IMAGE_HEIGHT = 1350;

// next/og(satori)不認識 CSS 變數,顏色只能寫死——這些值直接對應 styles/tokens.css 的淺色主題,
// 分享圖是要貼到 IG/X 的靜態圖片,不需要跟著使用者的深色模式走,固定用淺色版本。
const COLORS = {
  bg: "#F7F3EC",
  surfaceMuted: "#F1EEE6",
  border: "#D3D1C7",
  textPrimary: "#2C2C2A",
  textSecondary: "#5F5E5A",
  textMuted: "#888780",
  accentText: "#6B4A1E",
  success: "#3B6D11",
  danger: "#A32D2D",
};

// satori 預設字體不含中文字,自己去 Google Fonts 抓一份只含用得到字元的 TTF 子集。
async function getCJKFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&text=${encodeURIComponent(text)}`,
        {
          headers: {
            // 假裝成舊版瀏覽器,Google Fonts 才會回傳 satori 讀得懂的 TTF 而不是 WOFF2
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36",
          },
        }
      )
    ).text();

    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;

    const fontResponse = await fetch(match[1]);
    if (!fontResponse.ok) return null;
    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const showPrice = searchParams.get("price") !== "0";

  const card = await getShareableCard(id);
  if (!card) {
    return new Response("Not found", { status: 404 });
  }

  const isFlat = card.changePercent === 0;
  const isUp = card.changePercent > 0;
  const changeColor = isFlat ? COLORS.textMuted : isUp ? COLORS.success : COLORS.danger;
  const changeLabel = isFlat ? "持平" : `${isUp ? "+" : ""}${card.changePercent.toFixed(1)}%`;
  const priceText = `${card.currency} ${card.price.toLocaleString()}`;

  const sampleText = [
    card.name,
    card.game,
    card.series,
    card.variantLabel,
    card.shareCaption,
    card.tags.join(""),
    "Treasure",
    showPrice ? priceText + changeLabel : "",
    "尚未上傳照片",
  ].join("");

  const fontData = await getCJKFont(sampleText);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: COLORS.bg,
          padding: 64,
          fontFamily: fontData ? "Noto Sans TC" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", marginBottom: 40 }}>
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl}
              alt={card.name}
              width={560}
              height={784}
              style={{ objectFit: "cover", borderRadius: 4, border: `2px solid ${COLORS.border}` }}
            />
          ) : (
            <div
              style={{
                width: 560,
                height: 784,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: COLORS.surfaceMuted,
                borderRadius: 4,
                border: `2px solid ${COLORS.border}`,
              }}
            >
              <div style={{ display: "flex", fontSize: 28, color: COLORS.textMuted }}>尚未上傳照片</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>
          {card.name}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: COLORS.textSecondary, marginBottom: 24 }}>
          {card.game} · {card.series} · {card.variantLabel}
        </div>

        {showPrice && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", fontSize: 48, fontWeight: 700, color: COLORS.accentText }}>{priceText}</div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: changeColor }}>{changeLabel}</div>
          </div>
        )}

        {card.shareCaption && (
          <div
            style={{
              display: "flex",
              width: 800,
              textAlign: "center",
              justifyContent: "center",
              fontSize: 32,
              color: COLORS.textPrimary,
              marginBottom: 24,
            }}
          >
            {card.shareCaption}
          </div>
        )}

        {card.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 24 }}>
            {card.tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: COLORS.textSecondary,
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 999,
                  padding: "8px 24px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", marginTop: "auto", fontSize: 24, color: COLORS.textMuted }}>Treasure</div>
      </div>
    ),
    {
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      fonts: fontData ? [{ name: "Noto Sans TC", data: fontData, style: "normal", weight: 400 }] : undefined,
    }
  );
}
