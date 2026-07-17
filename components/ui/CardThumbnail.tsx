import Link from "next/link";
import { PhotoFrame } from "./PhotoFrame";
import { PriceTag } from "./PriceTag";

interface CardThumbnailProps {
  id: string;
  name: string;
  series: string;
  price: number;
  currency: string;
  changePercent: number;
  imageUrl?: string;
}

export function CardThumbnail({ id, name, series, price, currency, changePercent, imageUrl }: CardThumbnailProps) {
  return (
    <Link
      href={`/cards/${id}`}
      style={{ display: "flex", flexDirection: "column", gap: 8, color: "inherit", textDecoration: "none" }}
    >
      <PhotoFrame src={imageUrl} alt={name} size="large" />
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
        {name}
      </div>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)" }}>{series}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--color-accent-text)" }}>
          {currency} {price.toLocaleString()}
        </span>
        <PriceTag changePercent={changePercent} />
      </div>
    </Link>
  );
}
