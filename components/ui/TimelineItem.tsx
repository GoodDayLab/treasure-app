const EVENT_LABEL: Record<string, string> = {
  acquired: "入手",
  graded_submitted: "送鑑定",
  sold: "售出",
  story_added: "新增故事",
};

interface TimelineItemProps {
  eventType: string;
  eventDate: string;
  location?: string;
  note?: string;
  isLast?: boolean;
}

// 用一條直線串起事件點,最後一個節點不畫延伸線,避免懸空的線段。
export function TimelineItem({ eventType, eventDate, location, note, isLast = false }: TimelineItemProps) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 8, height: 8, marginTop: 4, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
        {!isLast && <div style={{ width: 1, flex: 1, background: "var(--color-border)", marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 20 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
          {EVENT_LABEL[eventType] ?? eventType}
          <span style={{ marginLeft: 8, fontWeight: 400, color: "var(--color-text-muted)" }}>{eventDate}</span>
        </div>
        {location && (
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {location}
          </div>
        )}
        {note && (
          <div style={{ fontFamily: "var(--font-voice)", fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}
