"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import type { TagDimensionWithTags } from "@/lib/data";

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontFamily: "var(--font-ui)",
  fontSize: 13,
  color: "var(--color-text-primary)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-ui)",
};

function DimensionCard({ dimension }: { dimension: TagDimensionWithTags }) {
  const router = useRouter();
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState("");

  const renameDimension = async () => {
    const name = window.prompt("維度新名稱", dimension.name);
    if (!name || name === dimension.name) return;
    await fetch(`/api/tag-dimensions/${dimension.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    router.refresh();
  };

  const deleteDimension = async () => {
    if (!window.confirm(`確定要刪除「${dimension.name}」這個維度嗎?底下的 ${dimension.tags.length} 個標籤也會一起刪除,卡片本身不會被刪除。`)) {
      return;
    }
    await fetch(`/api/tag-dimensions/${dimension.id}`, { method: "DELETE" });
    router.refresh();
  };

  const renameTag = async (tagId: string, currentName: string) => {
    const name = window.prompt("標籤新名稱", currentName);
    if (!name || name === currentName) return;
    const response = await fetch(`/api/tags/${tagId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      window.alert(body.error ?? "重新命名失敗");
      return;
    }
    router.refresh();
  };

  const deleteTag = async (tagId: string, name: string) => {
    if (!window.confirm(`確定要刪除標籤「${name}」嗎?會從所有卡片上移除這個標籤。`)) return;
    await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
    router.refresh();
  };

  const addTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setError("");
    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimensionId: dimension.id, name }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "新增失敗");
      return;
    }
    setNewTagName("");
    router.refresh();
  };

  return (
    <SectionCard title={dimension.name}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {dimension.tags.map((tag) => (
          <span
            key={tag.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-ui)",
              fontSize: 12,
              borderRadius: 999,
              padding: "3px 6px 3px 10px",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <button
              type="button"
              onClick={() => renameTag(tag.id, tag.name)}
              style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer" }}
            >
              {tag.name}
            </button>
            <button
              type="button"
              onClick={() => deleteTag(tag.id, tag.name)}
              aria-label={`刪除標籤 ${tag.name}`}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "var(--color-text-muted)",
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
        {dimension.tags.length === 0 && (
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-text-muted)" }}>還沒有標籤</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="新增標籤"
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <Button variant="ghost" onClick={addTag}>
          新增
        </Button>
      </div>
      {error && <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--color-danger)" }}>{error}</span>}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Button variant="ghost" onClick={renameDimension}>
          重新命名維度
        </Button>
        <Button variant="ghost" onClick={deleteDimension}>
          刪除維度
        </Button>
      </div>
    </SectionCard>
  );
}

export function TagManager({ dimensions }: { dimensions: TagDimensionWithTags[] }) {
  const router = useRouter();
  const [newDimensionName, setNewDimensionName] = useState("");

  const addDimension = async () => {
    const name = newDimensionName.trim();
    if (!name) return;
    await fetch("/api/tag-dimensions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setNewDimensionName("");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {dimensions.map((dimension) => (
        <DimensionCard key={dimension.id} dimension={dimension} />
      ))}

      <SectionCard title="新增維度">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={newDimensionName}
            onChange={(e) => setNewDimensionName(e.target.value)}
            placeholder="例如:年份、稀有度"
            onKeyDown={(e) => e.key === "Enter" && addDimension()}
          />
          <Button variant="primary" onClick={addDimension}>
            新增維度
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
