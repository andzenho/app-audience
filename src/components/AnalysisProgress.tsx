"use client";

import { useState, useEffect } from "react";
import { UserInputs, AnalysisResult } from "@/types/analysis";
import { Loader2, CheckCircle2, AlertCircle, Youtube, Globe, MessageSquare, Brain } from "lucide-react";

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "pending" | "loading" | "done" | "error";
  detail?: string;
}

export function AnalysisProgress({
  inputs,
  onComplete,
}: {
  inputs: UserInputs;
  onComplete: (result: AnalysisResult) => void;
}) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "youtube", label: "Ищем вирусные видео на YouTube...", icon: <Youtube size={20} />, status: "pending" },
    { id: "transcripts", label: "Читаем транскрипты топ-видео...", icon: <MessageSquare size={20} />, status: "pending" },
    { id: "comments", label: "Собираем комментарии аудитории...", icon: <MessageSquare size={20} />, status: "pending" },
    { id: "tiktok", label: "Ищем контент на TikTok...", icon: <Globe size={20} />, status: "pending" },
    { id: "reddit", label: "Ищем обсуждения на Reddit и форумах...", icon: <Globe size={20} />, status: "pending" },
    { id: "analysis", label: "Анализируем данные с ИИ...", icon: <Brain size={20} />, status: "pending" },
  ]);
  const [error, setError] = useState<string | null>(null);

  const updateStep = (id: string, update: Partial<ProgressStep>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...update } : s))
    );
  };

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = async () => {
    try {
      // Step 1: Collect data
      updateStep("youtube", { status: "loading" });
      updateStep("tiktok", { status: "loading" });
      updateStep("reddit", { status: "loading" });

      const collectRes = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!collectRes.ok) {
        const errData = await collectRes.json().catch(() => ({}));
        throw new Error(errData.error || "Data collection failed");
      }

      const collectData = await collectRes.json();

      // Update collection steps
      updateStep("youtube", {
        status: collectData.youtube?.length > 0 ? "done" : "error",
        detail: collectData.youtube?.length > 0
          ? `Найдено ${collectData.youtube.length} видео`
          : "YouTube API недоступен, продолжаем без видео",
      });
      updateStep("transcripts", {
        status: collectData.transcripts?.length > 0 ? "done" : "error",
        detail: collectData.transcripts?.length > 0
          ? `Получено ${collectData.transcripts.length} транскриптов`
          : "Транскрипты недоступны",
      });
      updateStep("comments", {
        status: collectData.comments?.length > 0 ? "done" : "error",
        detail: collectData.comments?.length > 0
          ? `Собрано ${collectData.comments.length} комментариев`
          : "Комментарии не найдены",
      });
      updateStep("tiktok", {
        status: collectData.tiktok?.length > 0 ? "done" : "error",
        detail: collectData.tiktok?.length > 0
          ? `Найдено ${collectData.tiktok.length} видео`
          : "TikTok API недоступен",
      });
      updateStep("reddit", {
        status: "done",
        detail: `Найдено ${collectData.webSearch?.length || 0} обсуждений`,
      });

      // Step 2: Claude analysis
      updateStep("analysis", { status: "loading" });

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, collectedData: collectData }),
      });

      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed");
      }

      const result: AnalysisResult = await analyzeRes.json();
      updateStep("analysis", { status: "done", detail: "Анализ завершён!" });

      setTimeout(() => onComplete(result), 1000);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Произошла ошибка");
      updateStep("analysis", { status: "error", detail: "Ошибка анализа" });
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "loading":
        return <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary)" }} />;
      case "done":
        return <CheckCircle2 size={18} style={{ color: "var(--accent-green)" }} />;
      case "error":
        return <AlertCircle size={18} style={{ color: "var(--accent-orange)" }} />;
      default:
        return <div className="w-[18px] h-[18px] rounded-full" style={{ background: "var(--card-border)" }} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "var(--primary)", opacity: 0.1 }}>
            <Brain size={32} style={{ color: "var(--primary)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Анализируем аудиторию</h2>
          <p style={{ color: "var(--muted)" }}>
            Собираем реальные данные и проводим глубокий анализ
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-4 rounded-xl transition-all animate-fade-in"
              style={{
                background: step.status !== "pending" ? "var(--card)" : "transparent",
                border: step.status !== "pending" ? "1px solid var(--card-border)" : "1px solid transparent",
                opacity: step.status === "pending" ? 0.4 : 1,
              }}
            >
              <div className="mt-0.5">{statusIcon(step.status)}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.label}</div>
                {step.detail && (
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {step.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: "#fef2f2", color: "var(--accent-red)" }}>
            <p className="font-medium">Ошибка: {error}</p>
            <button
              onClick={() => {
                setError(null);
                runAnalysis();
              }}
              className="mt-2 underline cursor-pointer"
            >
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
