"use client";

import { SavedAnalysis } from "@/types/analysis";
import { X, FileText, Trash2 } from "lucide-react";

export function HistorySidebar({
  history,
  onSelect,
  onClose,
}: {
  history: SavedAnalysis[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`analysis-${id}`);
    const saved = localStorage.getItem("audience-analyses");
    if (saved) {
      const analyses: SavedAnalysis[] = JSON.parse(saved);
      const filtered = analyses.filter((a) => a.id !== id);
      localStorage.setItem("audience-analyses", JSON.stringify(filtered));
    }
    window.location.reload();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 w-96 z-50 p-6 overflow-y-auto shadow-2xl"
        style={{ background: "var(--background)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">История анализов</h2>
          <button onClick={onClose} className="p-2 rounded-lg cursor-pointer" style={{ background: "var(--muted-bg)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] flex items-start gap-3 group"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <FileText size={20} style={{ color: "var(--primary)" }} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.productName}</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all cursor-pointer"
                style={{ background: "var(--muted-bg)" }}
              >
                <Trash2 size={14} style={{ color: "var(--accent-red)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
