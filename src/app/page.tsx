"use client";

import { useState, useEffect } from "react";
import { OnboardingChat } from "@/components/OnboardingChat";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { HistorySidebar } from "@/components/HistorySidebar";
import { UserInputs, AnalysisResult, SavedAnalysis } from "@/types/analysis";
import { History, Sparkles } from "lucide-react";

type AppState = "home" | "onboarding" | "analyzing";

export default function Home() {
  const [state, setState] = useState<AppState>("home");
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem("audience-analyses");
    if (saved) {
      const analyses: SavedAnalysis[] = JSON.parse(saved);
      setHistory(analyses);
    }
  };

  const handleOnboardingComplete = (userInputs: UserInputs) => {
    setInputs(userInputs);
    setState("analyzing");
  };

  const handleAnalysisComplete = (analysisResult: AnalysisResult) => {
    const saved = localStorage.getItem("audience-analyses");
    const analyses: SavedAnalysis[] = saved ? JSON.parse(saved) : [];
    analyses.unshift({
      id: analysisResult.id,
      createdAt: analysisResult.createdAt,
      productName: analysisResult.productName,
    });
    localStorage.setItem("audience-analyses", JSON.stringify(analyses));
    localStorage.setItem(`analysis-${analysisResult.id}`, JSON.stringify(analysisResult));
    loadHistory();
    window.location.href = `/report/${analysisResult.id}`;
  };

  const handleOpenAnalysis = (id: string) => {
    window.location.href = `/report/${id}`;
  };

  return (
    <div className="min-h-screen">
      {showHistory && (
        <HistorySidebar
          history={history}
          onSelect={handleOpenAnalysis}
          onClose={() => setShowHistory(false)}
        />
      )}

      {state === "home" && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "var(--muted-bg)" }}>
              <Sparkles size={16} style={{ color: "var(--primary)" }} />
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                AI-powered audience analysis
              </span>
            </div>

            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              Audience Intelligence
            </h1>
            <p className="text-xl mb-8" style={{ color: "var(--muted)" }}>
              Глубокий анализ целевой аудитории на основе реальных данных из YouTube, TikTok, Reddit и форумов
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setState("onboarding")}
                className="px-8 py-4 rounded-xl text-white font-medium text-lg transition-all hover:scale-105 cursor-pointer"
                style={{ background: "var(--primary)" }}
              >
                Начать анализ
              </button>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-8 py-4 rounded-xl font-medium text-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                  style={{ background: "var(--muted-bg)", color: "var(--foreground)" }}
                >
                  <History size={20} />
                  История ({history.length})
                </button>
              )}
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { title: "Реальные данные", desc: "Анализ комментариев, транскриптов и обсуждений из YouTube, TikTok, Reddit" },
                { title: "AI-анализ", desc: "Claude анализирует по методологиям Russell Brunson, Frank Kern и Ryan Deiss" },
                { title: "Готовые решения", desc: "Хуки, офферы, контент-план и стратегия продаж на основе данных" },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === "onboarding" && (
        <OnboardingChat
          onComplete={handleOnboardingComplete}
          onBack={() => setState("home")}
        />
      )}

      {state === "analyzing" && inputs && (
        <AnalysisProgress
          inputs={inputs}
          onComplete={handleAnalysisComplete}
        />
      )}
    </div>
  );
}
