import { notFound } from "next/navigation";
import { getCardDetail } from "@/lib/data";
import { CardDetail } from "./CardDetail";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getCardDetail(id);

  if (!card) {
    notFound();
  }

  return <CardDetail card={card} />;
}
