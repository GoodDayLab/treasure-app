"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TimelineItem } from "@/components/ui/TimelineItem";
import type { TimelineEntry } from "@/lib/data";

const EVENT_TYPE_OPTIONS = [
  { value: "acquired", label: "入手" },
  { value: "graded_submitted", label: "送鑑定" },
  { value: "sold", label: "售出" },
  { value: "story_added", label: "新增故事" },
];

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontFamily: "var(--font-ui)",
  fontSize: 13,
  color: "var(--color-text-primary)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-ui)",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function EventForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<TimelineEntry>;
  onSubmit: (values: { eventType: string; eventDate: string; location: string; note: string }) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [eventType, setEventType] = useState(initial?.eventType ?? "acquired");
  const [eventDate, setEventDate] = useState(initial?.eventDate ?? todayISO());
  const [location, setLocation] = useState(initial?.location ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "var(--color-surface-muted)", borderRadius: "var(--radius-ui)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <select style={inputStyle} value={eventType} onChange={(e) => setEventType(e.target.value)}>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input style={inputStyle} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      <input style={inputStyle} placeholder="地點(選填)" value={location} onChange={(e) => setLocation(e.target.value)} />
      <input style={inputStyle} placeholder="備註(選填)" value={note} onChange={(e) => setNote(e.target.value)} />
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="primary"
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true);
            await onSubmit({ eventType, eventDate, location, note });
            setIsSaving(false);
          }}
        >
          {isSaving ? "儲存中…" : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </div>
  );
}

export function TimelineManager({ itemId, events }: { itemId: string; events: TimelineEntry[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleUpdate = async (id: string, values: { eventType: string; eventDate: string; location: string; note: string }) => {
    await fetch(`/api/timeline-events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("確定要刪除這筆時間軸事件嗎?")) return;
    await fetch(`/api/timeline-events/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleAdd = async (values: { eventType: string; eventDate: string; location: string; note: string }) => {
    await fetch("/api/timeline-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, ...values }),
    });
    setIsAdding(false);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        {events.map((event, index) =>
          editingId === event.id ? (
            <div key={event.id} style={{ paddingBottom: index === events.length - 1 ? 0 : 20 }}>
              <EventForm
                initial={event}
                submitLabel="儲存"
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => handleUpdate(event.id, values)}
              />
            </div>
          ) : (
            <div key={event.id} style={{ position: "relative" }}>
              <TimelineItem
                eventType={event.eventType}
                eventDate={event.eventDate}
                location={event.location}
                note={event.note}
                isLast={index === events.length - 1}
              />
              <div style={{ display: "flex", gap: 12, marginTop: -14, marginLeft: 20, marginBottom: index === events.length - 1 ? 0 : 6 }}>
                <button
                  type="button"
                  onClick={() => setEditingId(event.id)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--color-text-muted)" }}
                >
                  刪除
                </button>
              </div>
            </div>
          )
        )}
        {events.length === 0 && (
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-muted)" }}>還沒有任何時間軸事件</span>
        )}
      </div>

      {isAdding ? (
        <EventForm submitLabel="新增事件" onCancel={() => setIsAdding(false)} onSubmit={handleAdd} />
      ) : (
        <Button variant="ghost" onClick={() => setIsAdding(true)}>
          + 新增事件
        </Button>
      )}
    </div>
  );
}
