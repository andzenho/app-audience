"use client";

import { useState, useRef, useEffect } from "react";
import { UserInputs } from "@/types/analysis";
import { ArrowLeft, Send, CheckCircle2, Sparkles } from "lucide-react";

const QUESTIONS = [
  {
    key: "product",
    question: "Что за продукт или услуга? Опиши кратко суть и какой результат получает клиент",
    placeholder: "Например: Онлайн-курс по SMM для малого бизнеса. Клиент получает навыки ведения соцсетей и рост продаж...",
    confirm: "Отлично, понял суть продукта!",
  },
  {
    key: "priceSegment",
    question: "Какой ценовой сегмент? Назови чек (в рублях или долларах)",
    placeholder: "Например: 49 000 руб., или $199/мес...",
    confirm: "Понял ценовой диапазон.",
  },
  {
    key: "existingClients",
    question: "Есть уже клиенты? Если да — опиши 2-3 лучших: кто они, почему купили, какой результат получили",
    placeholder: "Например: Марина, владелица кофейни, пришла через Instagram. За 2 месяца выросла с 500 до 3000 подписчиков...",
    confirm: "Ценная информация о клиентах!",
  },
  {
    key: "excludedClients",
    question: "Кого НЕ хочешь видеть в клиентах? (типы людей, ситуации, запросы)",
    placeholder: "Например: Людей, которые ищут «бесплатно и быстро», не готовы вкладывать время...",
    confirm: "Понял, кого исключаем.",
  },
  {
    key: "niche",
    question: "В какой нише/рынке работаешь?",
    placeholder: "Например: Онлайн-образование, маркетинг, IT...",
    confirm: "Отличная ниша!",
  },
  {
    key: "reviews",
    question: "Есть отзывы, переписки с клиентами или записи созвонов? Можешь вставить текстом прямо сюда",
    placeholder: "Вставьте текст отзывов или напишите «нет»...",
    confirm: "Спасибо! У меня есть всё необходимое для анализа.",
  },
];

interface Message {
  type: "bot" | "user" | "confirm";
  text: string;
}

export function OnboardingChat({
  onComplete,
  onBack,
}: {
  onComplete: (inputs: UserInputs) => void;
  onBack: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: QUESTIONS[0].question },
  ]);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStep]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const newAnswers = { ...answers, [QUESTIONS[currentStep].key]: input.trim() };
    setAnswers(newAnswers);

    const newMessages: Message[] = [
      ...messages,
      { type: "user", text: input.trim() },
    ];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const withConfirm: Message[] = [
        ...newMessages,
        { type: "confirm", text: QUESTIONS[currentStep].confirm },
      ];

      if (currentStep < QUESTIONS.length - 1) {
        setTimeout(() => {
          setMessages([
            ...withConfirm,
            { type: "bot", text: QUESTIONS[currentStep + 1].question },
          ]);
          setCurrentStep(currentStep + 1);
          setIsTyping(false);
        }, 500);
      } else {
        setMessages(withConfirm);
        setIsComplete(true);
        setIsTyping(false);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartAnalysis = () => {
    onComplete(answers as unknown as UserInputs);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={16} />
          Назад
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Вопрос {Math.min(currentStep + 1, QUESTIONS.length)} из {QUESTIONS.length}
          </span>
          <div className="flex gap-1">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-8 rounded-full transition-all"
                style={{
                  background: i <= currentStep ? "var(--primary)" : "var(--card-border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.type === "confirm" ? (
              <div className="flex items-center gap-2 text-sm py-2" style={{ color: "var(--accent-green)" }}>
                <CheckCircle2 size={16} />
                {msg.text}
              </div>
            ) : (
              <div
                className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                  msg.type === "user"
                    ? "text-white rounded-br-sm"
                    : "rounded-bl-sm"
                }`}
                style={{
                  background: msg.type === "user" ? "var(--primary)" : "var(--card)",
                  border: msg.type === "bot" ? "1px solid var(--card-border)" : "none",
                }}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="px-5 py-4 rounded-2xl rounded-bl-sm" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
        {isComplete ? (
          <button
            onClick={handleStartAnalysis}
            className="w-full py-4 rounded-xl text-white font-medium text-lg transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
            style={{ background: "var(--primary)" }}
          >
            <Sparkles size={20} />
            Начать анализ аудитории
          </button>
        ) : (
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={QUESTIONS[currentStep]?.placeholder}
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 text-[15px]"
              style={{
                background: "var(--muted-bg)",
                "--tw-ring-color": "var(--primary)",
              } as React.CSSProperties}
              disabled={isTyping}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isTyping}
              className="p-3 rounded-xl text-white transition-all disabled:opacity-40 cursor-pointer"
              style={{ background: "var(--primary)" }}
            >
              <Send size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
