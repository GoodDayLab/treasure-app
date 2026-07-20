import { getTagDimensions } from "@/lib/data";
import { TagManager } from "./TagManager";

export default async function TagsPage() {
  const dimensions = await getTagDimensions();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 24, margin: "0 0 8px 0", color: "var(--color-text-primary)" }}>
        標籤管理
      </h1>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>
        標籤分維度管理(例如「系列」「用途」「鑑定狀態」),一張卡可以同時掛上多個不同維度的標籤。
      </p>
      <TagManager dimensions={dimensions} />
    </main>
  );
}
