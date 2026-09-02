import React, { useState, useEffect, useRef } from "react";
import {
  Client,
  Gym,
  Routine,
  CompletedWorkout,
  Payment,
  ClientExtraPurchase,
  GymTip,
  ChatMessage,
  MuscleGroup,
} from "../../types";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  Calendar,
  CreditCard,
  Coffee,
  Lightbulb,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
  Info,
} from "lucide-react";

interface ClientViewProps {
  currentClient: Client;
  currentGym: Gym;
  routines: Routine[];
  completedWorkouts: CompletedWorkout[];
  onToggleWorkoutCompleted: (routineId: string, day: string) => void;
  payments: Payment[];
  extraPurchases: ClientExtraPurchase[];
  tips: GymTip[];
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "Pecho",
  "Espalda",
  "Piernas",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Abdomen / Core",
  "Cardio & Full Body",
];

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;

export const ClientView: React.FC<ClientViewProps> = ({
  currentClient,
  currentGym,
  routines,
  completedWorkouts,
  onToggleWorkoutCompleted,
  payments,
  extraPurchases,
  tips,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "rutinas" | "deuda" | "extras" | "tips">("chat");

  // Determine current day of week in Spanish
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayNamesMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const todayDayName = dayNamesMap[dayIndex];

  // Client specific workouts
  const clientCompleted = completedWorkouts.filter((w) => w.clientId === currentClient.id);
  const completedDaysThisWeek = clientCompleted.map((w) => w.day);
  const clientPayments = payments.filter((p) => p.clientId === currentClient.id);
  const clientExtras = extraPurchases.filter((e) => e.clientId === currentClient.id);

  // Routines of the client's gym
  const gymRoutines = routines.filter((r) => r.gymId === currentGym.id);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "deepseek",
      text: `¡Hola **${currentClient.name}**! 👋 Soy tu **DeepSeek Coach** de **${currentGym.name}**.\n\nHoy es **${todayDayName}**. Puedes preguntarme qué rutina te toca hoy, elegir entrenar por grupo muscular (Pecho, Espalda, Piernas, etc.), revisar cuántas rutinas has completado esta semana o consultar tu control de pagos y deuda.\n\n¿Qué quieres entrenar hoy?`,
      thought: `Inicializando contexto del atleta: ${currentClient.name} (${currentGym.name}). Estado de deuda: $${currentClient.debtAmount} USD. Rutinas completadas esta semana: ${completedDaysThisWeek.length}.`,
      timestamp: "Ahora",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showThought, setShowThought] = useState<Record<string, boolean>>({ "init-1": true });
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("todos");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          clientName: currentClient.name,
          gymName: currentGym.name,
          todayDayName,
          assignedRoutines: gymRoutines,
          weeklyCompleted: completedDaysThisWeek,
          debtAmount: currentClient.debtAmount,
          extras: clientExtras,
          tips: tips.map((t) => ({ title: t.title, content: t.content, category: t.category })),
          selectedMuscleGroup: selectedMuscleFilter !== "todos" ? selectedMuscleFilter : undefined,
        }),
      });

      const data = await res.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "deepseek",
        text: data.reply || "He procesado tu consulta.",
        thought: data.thought,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      if (data.thought) {
        setShowThought((prev) => ({ ...prev, [botMessage.id]: true }));
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "deepseek",
          text: `Hubo un inconveniente al conectar con el servidor, pero según tu registro:\nHoy **${todayDayName}**, puedes consultar tus rutinas en la pestaña de Rutinas o revisar tu deuda actual de **$${currentClient.debtAmount} USD**.`,
          timestamp: "Ahora",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleThought = (msgId: string) => {
    setShowThought((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const isTodayCompleted = completedDaysThisWeek.includes(todayDayName);
  const todaysRoutine = gymRoutines.find((r) => r.day.toLowerCase() === todayDayName.toLowerCase());

  const filteredRoutines = gymRoutines.filter((r) => {
    if (selectedMuscleFilter === "todos") return true;
    return r.muscleGroup === selectedMuscleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Client Greeting & Weekly Control Banner */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm text-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                Portal Atleta
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">
                {currentGym.name}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              ¡Hola, {currentClient.name}!
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Membresía: <span className="font-semibold text-slate-200">{currentClient.membershipPlan}</span> • Cuota: <span className="font-mono text-emerald-400 font-bold">${currentClient.monthlyFee} USD</span>
            </p>
          </div>

          {/* Quick Debt Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
                currentClient.debtAmount > 0
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider">Control de Deuda</p>
                <p className="text-sm font-bold font-mono">
                  {currentClient.debtAmount > 0
                    ? `Debe: $${currentClient.debtAmount} USD`
                    : "✓ Al Día (Sin deuda)"}
                </p>
              </div>
              <CreditCard className="w-5 h-5 opacity-80" />
            </div>
          </div>
        </div>

        {/* WEEKLY TRACKER BAR (Rutinas efectuadas / realizadas en la semana) */}
        <div className="mt-5 pt-5 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Control Semanal de Rutinas Realizadas:
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {completedDaysThisWeek.length} de 5 días completados
              </span>
            </div>
            {todaysRoutine && (
              <button
                onClick={() => onToggleWorkoutCompleted(todaysRoutine.id, todayDayName)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                  isTodayCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-emerald-500 text-slate-950 border-emerald-500 hover:bg-emerald-400 shadow-sm"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isTodayCompleted ? "✓ Rutina de hoy marcada como completada" : "Marcar rutina de hoy como realizada"}
              </button>
            )}
          </div>

          {/* 7 Days of the Week Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isCompleted = completedDaysThisWeek.includes(day);
              const isToday = day === todayDayName;
              const routineForDay = gymRoutines.find((r) => r.day === day);

              return (
                <div
                  key={day}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCompleted
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm"
                      : isToday
                      ? "bg-slate-850 border-emerald-500 text-white ring-1 ring-emerald-500/40"
                      : "bg-slate-950/80 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span>{day}</span>
                    {isCompleted ? (
                      <span className="text-emerald-400">✓</span>
                    ) : isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ) : null}
                  </div>

                  <p className="text-[11px] font-bold truncate text-slate-200">
                    {routineForDay ? routineForDay.muscleGroup : "Descanso"}
                  </p>

                  <div className="mt-1.5">
                    {routineForDay ? (
                      <button
                        onClick={() => onToggleWorkoutCompleted(routineForDay.id, day)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            : "bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950"
                        }`}
                      >
                        {isCompleted ? "Hecho" : "Marcar"}
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">Libre</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geometric Balance Client Tabs */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden text-slate-200">
        <div className="border-b border-slate-800 flex flex-wrap px-4 bg-slate-950/60">
          <button
            id="client-tab-chat"
            onClick={() => setActiveTab("chat")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "chat"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            Chatbot DeepSeek AI
          </button>

          <button
            id="client-tab-rutinas"
            onClick={() => setActiveTab("rutinas")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "rutinas"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Mis Rutinas Semanales ({gymRoutines.length})
          </button>

          <button
            id="client-tab-deuda"
            onClick={() => setActiveTab("deuda")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "deuda"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Control de Deuda
          </button>

          <button
            id="client-tab-extras"
            onClick={() => setActiveTab("extras")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "extras"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coffee className="w-4 h-4" />
            Consumos Extras ({clientExtras.length})
          </button>

          <button
            id="client-tab-tips"
            onClick={() => setActiveTab("tips")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "tips"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/90"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Tips del Gym ({tips.length})
          </button>
        </div>

        {/* TAB 1: CHATBOT DEEPSEEK */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[650px] bg-slate-950 text-slate-100 rounded-b-2xl overflow-hidden">
            {/* DeepSeek Dark UI Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white font-mono">
                      DeepSeek Coach AI
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      R1-Reasoning
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Rutinas de {todayDayName} • Musculación • Control semanal ({completedDaysThisWeek.length} hechas)
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px]">En línea</span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "deepseek" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm space-y-2 ${
                      m.sender === "user"
                        ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                    }`}
                  >
                    {/* DeepSeek Collapsible Thought Block */}
                    {m.thought && (
                      <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-400 font-mono">
                        <button
                          onClick={() => toggleThought(m.id)}
                          className="flex items-center justify-between w-full font-mono text-[10px] text-emerald-400 hover:text-emerald-300 font-bold mb-1"
                        >
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            Pensamiento de DeepSeek (Razonamiento)
                          </span>
                          {showThought[m.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        {showThought[m.id] && (
                          <p className="italic leading-relaxed border-t border-slate-800/80 pt-1.5 text-slate-400 font-sans">
                            {m.thought}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line leading-relaxed text-xs">
                      {m.text}
                    </div>

                    <div
                      className={`text-[10px] pt-1 text-right font-mono ${
                        m.sender === "user" ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 text-slate-950">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-slate-400 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] font-mono text-emerald-400">DeepSeek razonando rutina...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  onClick={() => handleSendMessage(`¿Qué rutina me toca hoy ${todayDayName}?`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-semibold whitespace-nowrap transition-colors font-mono"
                >
                  🔥 Rutina de Hoy ({todayDayName})
                </button>
                <button
                  onClick={() => handleSendMessage("Quiero ver ejercicios de Pecho y Tríceps")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  💪 Pecho & Tríceps
                </button>
                <button
                  onClick={() => handleSendMessage("Quiero entrenar Piernas completas")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  🦵 Piernas
                </button>
                <button
                  onClick={() => handleSendMessage("Quiero entrenar Espalda y Bíceps")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  🦅 Espalda & Bíceps
                </button>
                <button
                  onClick={() => handleSendMessage("¿Cuántas rutinas llevo realizadas esta semana?")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-semibold whitespace-nowrap transition-colors font-mono"
                >
                  📊 Control Semanal
                </button>
                <button
                  onClick={() => handleSendMessage("¿Cuánto debo de mensualidad o consumos?")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/40 text-[11px] font-semibold whitespace-nowrap transition-colors font-mono"
                >
                  💳 Mi Deuda
                </button>
                <button
                  onClick={() => handleSendMessage("Dame un tip de nutrición para hoy")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors"
                >
                  🥗 Tip Nutrición
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="client-chat-input"
                  type="text"
                  placeholder="Pregúntale a DeepSeek Coach (ej: '¿Qué hago hoy?', 'Pecho', '¿Cuánto debo?')..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  id="client-chat-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMsg.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MIS RUTINAS SEMANALES */}
        {activeTab === "rutinas" && (
          <div className="p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Plan de Entrenamiento Semanal en {currentGym.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Consulta tu rutina por día o filtra por grupo muscular. Marca cada sesión como efectuada para llevar tu control semanal.
                </p>
              </div>

              {/* Muscle Group Filter */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <select
                  value={selectedMuscleFilter}
                  onChange={(e) => setSelectedMuscleFilter(e.target.value)}
                  className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-semibold text-slate-200 focus:border-emerald-500"
                >
                  <option value="todos">Todos los Grupos Musculares</option>
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Routines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoutines.map((r) => {
                const isCompleted = completedDaysThisWeek.includes(r.day);
                const isToday = r.day === todayDayName;

                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isCompleted
                        ? "bg-slate-950/90 border-emerald-500/40 shadow-sm"
                        : isToday
                        ? "bg-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/20"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                            ¡Hoy!
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {r.muscleGroup}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm mb-1">{r.name}</h3>
                    <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {r.estimatedMinutes} min • Nivel: {r.level}
                    </p>

                    {/* Exercises List */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/90 space-y-2 mb-3 text-xs">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                        Ejercicios del protocolo ({r.exercises.length}):
                      </p>
                      {r.exercises.map((ex, idx) => (
                        <div key={ex.id || idx} className="border-b border-slate-800/60 last:border-0 pb-1.5 last:pb-0">
                          <div className="flex justify-between font-medium text-slate-200 text-[11px]">
                            <span>{idx + 1}. {ex.name}</span>
                            <span className="font-mono text-emerald-400 font-bold">{ex.sets}x{ex.reps}</span>
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5">{ex.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {r.notes && (
                      <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800 mb-3">
                        💡 {r.notes}
                      </p>
                    )}

                    {/* Checkbox button */}
                    <button
                      onClick={() => onToggleWorkoutCompleted(r.id, r.day)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isCompleted ? "✓ Rutina Efectuada esta Semana" : "Marcar como Realizada"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CONTROL DE DEUDA */}
        {activeTab === "deuda" && (
          <div className="p-5 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white">
                Estado Financiero y Control de Deuda
              </h2>
              <p className="text-xs text-slate-400">
                Transparencia total de tus cuotas mensuales y consumos en cafetería/extras.
              </p>
            </div>

            {/* Debt Status Card */}
            <div
              className={`p-6 rounded-2xl border ${
                currentClient.debtAmount > 0
                  ? "bg-rose-500/10 border-rose-500/30"
                  : "bg-slate-950/80 border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span
                    className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded font-mono ${
                      currentClient.debtAmount > 0
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {currentClient.debtAmount > 0 ? "Saldo Pendiente" : "Estado al Día"}
                  </span>
                  <h3 className="text-3xl font-bold font-mono text-white mt-2">
                    {currentClient.debtAmount > 0 ? (
                      <span className="text-rose-400">${currentClient.debtAmount} USD</span>
                    ) : (
                      <span className="text-emerald-400">$0.00 USD</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentClient.debtAmount > 0
                      ? "Tienes un saldo por regularizar correspondiente a tu cuota o compras de barra."
                      : "¡Felicidades! Tu cuenta se encuentra completamente al día y tu acceso está activo."}
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-1 sm:min-w-[220px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Membresía actual:</span>
                    <span className="font-bold font-mono text-emerald-400">${currentClient.monthlyFee} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Plan:</span>
                    <span className="font-bold text-slate-200">{currentClient.membershipPlan}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sede:</span>
                    <span className="font-bold text-slate-200">{currentGym.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                Historial de Pagos & Recibos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Concepto</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Monto</th>
                      <th className="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {clientPayments.length > 0 ? (
                      clientPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{p.date}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{p.concept}</td>
                          <td className="py-2.5 px-3 text-slate-300">{p.paymentMethod}</td>
                          <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">+${p.amount} USD</td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-mono">
                              ✓ Pagado
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          No hay recibos de pago anteriores registrados para este usuario.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXTRAS & CAFETERÍA */}
        {activeTab === "extras" && (
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Tus Consumos en Barra & Cafetería
              </h2>
              <p className="text-xs text-slate-400">
                Registro de batidos de proteína, bebidas isotónicas y suplementos comprados en {currentGym.name}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Producto / Servicio</th>
                    <th className="py-2.5 px-3">Cantidad</th>
                    <th className="py-2.5 px-3">Precio Unitario</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Estado de Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientExtras.length > 0 ? (
                    clientExtras.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{ex.date}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{ex.itemName}</td>
                        <td className="py-2.5 px-3 font-mono">{ex.quantity}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">${ex.price} USD</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">${ex.total} USD</td>
                        <td className="py-2.5 px-3">
                          {ex.isPaid ? (
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30 font-mono">
                              Pagado al momento
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[10px] border border-amber-500/30 font-mono">
                              Cargado a Deuda
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-500">
                        Aún no tienes consumos extras registrados. ¡Pide tu batido de proteína en recepción!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: TIPS */}
        {activeTab === "tips" && (
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Consejos de los Entrenadores de {currentGym.name}
              </h2>
              <p className="text-xs text-slate-400">
                Pautas de nutrición, técnica y recuperación para maximizar tu progreso físico.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip) => (
                <div key={tip.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                      {tip.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{tip.date}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{tip.content}</p>
                  <p className="text-[10px] font-semibold text-slate-400 font-mono">Por: {tip.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
