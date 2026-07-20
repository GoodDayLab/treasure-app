import { getTagDimensions, getLots } from "@/lib/data";
import { NewCardForm } from "./NewCardForm";

export default async function NewCardPage() {
  const [tagDimensions, lots] = await Promise.all([getTagDimensions(), getLots()]);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontFamily: "var(--font-voice)", fontSize: 24, margin: "0 0 24px 0", color: "var(--color-text-primary)" }}>
        新增卡片
      </h1>
      <NewCardForm tagDimensions={tagDimensions} lots={lots} />
    </main>
  );
}
