import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Send,
  Sparkles,
  Phone,
  Moon,
  Zap,
  ShieldCheck,
  CheckCircle,
  Clock,
  Volume2,
  RefreshCw,
  MessageCircle,
  Sliders,
  Smile,
  Info,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Wind,
  X,
} from 'lucide-react';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodLevel, ChatMessage, DailyCheckInRecord } from '../types';

interface DailyCheckInProps {
  onSaveCheckIn: (checkIn: Partial<DailyCheckInRecord>) => void;
  onOpenHelpline: () => void;
  onRequestCounsellor: () => void;
}

export interface BreathPhaseInfo {
  name: 'Inhale' | 'Hold' | 'Exhale';
  duration: number;
  instruction: string;
  subtext: string;
  ringColor: string;
  bgGradient: string;
  scaleClass: string;
}

export const BREATH_PHASES: readonly BreathPhaseInfo[] = [
  {
    name: 'Inhale',
    duration: 4,
    instruction: 'Breathe in quietly through your nose',
    subtext: 'Feel your lungs and chest gently expand with calm',
    ringColor: '#38bdf8',
    bgGradient: 'from-sky-600 via-sky-700 to-blue-800',
    scaleClass: 'scale-110 ring-4 ring-sky-300/80 bg-white/20 shadow-lg shadow-sky-500/30',
  },
  {
    name: 'Hold',
    duration: 7,
    instruction: 'Hold your breath gently',
    subtext: 'Keep your body still, jaw relaxed, and shoulders soft',
    ringColor: '#fbbf24',
    bgGradient: 'from-amber-600 via-amber-700 to-orange-800',
    scaleClass: 'scale-105 ring-4 ring-amber-300/80 bg-white/20 shadow-lg shadow-amber-500/30',
  },
  {
    name: 'Exhale',
    duration: 8,
    instruction: 'Exhale fully through your mouth',
    subtext: 'Release all stress and tension with a gentle whoosh',
    ringColor: '#34d399',
    bgGradient: 'from-teal-600 via-emerald-700 to-slate-800',
    scaleClass: 'scale-90 ring-4 ring-emerald-300/80 bg-white/15 shadow-lg shadow-emerald-500/30',
  },
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  onSaveCheckIn,
  onOpenHelpline,
  onRequestCounsellor,
}) => {
  // Mode: 'guided' (step-by-step emojis, sliders, buttons) or 'chat' (conversational chatbot)
  const [activeMode, setActiveMode] = useState<'guided' | 'chat'>('guided');

  // Guided check-in state
  const [step, setStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>('okay');
  const [energy, setEnergy] = useState<number>(3);
  const [sleep, setSleep] = useState<'good' | 'fair' | 'poor' | 'disturbed'>('fair');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [optionalNote, setOptionalNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 4-7-8 Breathing exercise state (Strict order: 0: Inhale 4s -> 1: Hold 7s -> 2: Exhale 8s)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathSession, setBreathSession] = useState({
    phaseIndex: 0, // 0: Inhale (4s), 1: Hold (7s), 2: Exhale (8s)
    secondsLeft: 4,
    cycleCount: 1,
    isPaused: false,
  });

  const startBreathing = () => {
    setBreathSession({
      phaseIndex: 0,
      secondsLeft: 4,
      cycleCount: 1,
      isPaused: false,
    });
    setIsBreathingActive(true);
  };

  const closeBreathing = () => {
    setIsBreathingActive(false);
    setBreathSession({
      phaseIndex: 0,
      secondsLeft: 4,
      cycleCount: 1,
      isPaused: false,
    });
  };

  const togglePauseBreathing = () => {
    setBreathSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const resetBreathing = () => {
    setBreathSession({
      phaseIndex: 0,
      secondsLeft: 4,
      cycleCount: 1,
      isPaused: false,
    });
  };

  const setSpecificPhase = (index: number) => {
    setBreathSession((prev) => ({
      ...prev,
      phaseIndex: index,
      secondsLeft: BREATH_PHASES[index].duration,
      isPaused: false,
    }));
  };

  // Breathing cycle animation: Inhale (4s) -> Hold (7s) -> Exhale (8s)
  useEffect(() => {
    if (!isBreathingActive || breathSession.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setBreathSession((prev) => {
        if (prev.isPaused) return prev;

        if (prev.secondsLeft > 1) {
          return {
            ...prev,
            secondsLeft: prev.secondsLeft - 1,
          };
        }

        // Current phase reached 1s -> transitions strictly: Inhale -> Hold -> Exhale -> Inhale
        const nextPhaseIndex = (prev.phaseIndex + 1) % 3;
        const nextCycle = nextPhaseIndex === 0 ? prev.cycleCount + 1 : prev.cycleCount;

        return {
          ...prev,
          phaseIndex: nextPhaseIndex,
          secondsLeft: BREATH_PHASES[nextPhaseIndex].duration,
          cycleCount: nextCycle,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathSession.isPaused]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Namaste Priya. I am Saathi, your gentle companion. Take your time today—there is no rush. How can I support you right now?',
      timestamp: 'Just now',
      quickReplies: [
        'I am feeling anxious about court',
        'Guide me through a breathing exercise',
        'I just want to vent safely',
        'Connect me to NHAA 14566',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeMode, isTyping]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinishGuided = () => {
    onSaveCheckIn({
      mood: selectedMood,
      energyLevel: energy,
      sleepQuality: sleep,
      notes: optionalNote,
      tags: selectedTags,
    });
    setIsCompleted(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Build conversation history for context
      const historyPayload = chatMessages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: {
            mood: selectedMood,
            energy,
            sleep,
            tags: selectedTags,
            note: optionalNote,
            caseStage: 'Trial & Hearing Stage',
            legalAid: 'DLSA Central Delhi • Advocate Panel',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Thank you for sharing that with me. I am right here listening with you.';
      const quickReplies = Array.isArray(data.quickReplies) && data.quickReplies.length > 0
        ? data.quickReplies
        : ['I feel a bit better', 'Start breathing circle', 'Call NHAA 14566'];

      // If user requested breathing or AI suggested breathing for anxiety
      if (data.suggestedAction === 'breathing' && (text.toLowerCase().includes('breath') || text.toLowerCase().includes('panic') || text.toLowerCase().includes('anxious'))) {
        startBreathing();
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botReply,
          timestamp: 'Just now',
          quickReplies,
        },
      ]);
    } catch (err) {
      console.warn('Chat request failed, providing empathetic local fallback:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: 'I am right here with you. Take a soft, gentle breath. Remember that your safety and well-being come first, and you can reach National Helpline 14566 anytime toll-free.',
          timestamp: 'Just now',
          quickReplies: ['Start 4-7-8 breathing', 'Tell me my legal rights', 'Call NHAA 14566'],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: 'Namaste Priya. I am Saathi, your gentle companion. Take your time today—there is no rush. How can I support you right now?',
        timestamp: 'Just now',
        quickReplies: [
          'I am feeling anxious about court',
          'Guide me through a breathing exercise',
          'I just want to vent safely',
          'Connect me to NHAA 14566',
        ],
      },
    ]);
  };

  const tagOptions = [
    'Court Anxiety',
    'Family Support',
    'Felt Peaceful',
    'Restless Sleep',
    'Fatigue',
    'Grateful',
    'Needed Quiet Time',
    'Safe Space',
  ];

  const currentPhase = BREATH_PHASES[breathSession.phaseIndex];
  const progressRadius = 54;
  const circumference = 2 * Math.PI * progressRadius;
  const progressFraction = (currentPhase.duration - breathSession.secondsLeft + 1) / currentPhase.duration;
  const strokeOffset = circumference * (1 - Math.min(1, Math.max(0, progressFraction)));

  return (
    <div className="w-full pb-24 space-y-4 animate-in fade-in duration-300">
      {/* Top Segmented Controls */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-sky-100 shadow-sm flex items-center">
        <button
          onClick={() => setActiveMode('guided')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
            activeMode === 'guided'
              ? 'bg-sky-50 text-sky-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Quick Check-In</span>
        </button>

        <button
          onClick={() => setActiveMode('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
            activeMode === 'chat'
              ? 'bg-sky-50 text-sky-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Chat with Saathi</span>
        </button>
      </div>

      {/* Guided 4-7-8 Breathing Card (Inhale 4s -> Hold 7s -> Exhale 8s) */}
      {isBreathingActive ? (
        <div
          id="breathing-exercise-card"
          className={`bg-gradient-to-br ${currentPhase.bgGradient} rounded-3xl p-5 sm:p-6 text-white text-center shadow-xl shadow-sky-950/20 relative overflow-hidden animate-in zoom-in-95 duration-300 transition-all`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] uppercase font-extrabold tracking-wider text-white/95">
                4-7-8 Somatic Calming Circle
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white border border-white/25">
                Cycle #{breathSession.cycleCount}
              </span>
            </div>
            <button
              type="button"
              onClick={closeBreathing}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1 font-semibold px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition min-h-[32px]"
              title="Close Breathing Exercise"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          {/* 3-Step Flow Breadcrumbs (Explicitly displays 1: Inhale -> 2: Hold -> 3: Exhale order) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-xs sm:max-w-sm mx-auto mb-4">
            {BREATH_PHASES.map((p, idx) => {
              const isActive = breathSession.phaseIndex === idx;
              const isDoneInCurrentCycle = breathSession.phaseIndex > idx;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSpecificPhase(idx)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 border ${
                    isActive
                      ? 'bg-white text-slate-900 border-white shadow-md ring-2 ring-white/50 scale-102 font-extrabold'
                      : isDoneInCurrentCycle
                      ? 'bg-white/25 text-white border-white/30'
                      : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/15'
                  }`}
                >
                  <span>
                    {idx + 1}. {p.name}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-slate-600' : 'opacity-80'}`}>
                    ({p.duration}s)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Central Animated Breathing Bubble with SVG Countdown Ring */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto flex items-center justify-center my-2 select-none">
            {/* SVG Circular Progress Track */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r={progressRadius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="5"
              />
              <circle
                cx="60"
                cy="60"
                r={progressRadius}
                fill="transparent"
                stroke={currentPhase.ringColor}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Concentric Animated Core Bubble */}
            <div
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${currentPhase.scaleClass}`}
            >
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/90 mb-0.5">
                Step {breathSession.phaseIndex + 1} of 3
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight block drop-shadow-xs">
                {currentPhase.name}
              </span>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                  {breathSession.secondsLeft}
                </span>
                <span className="text-xs font-bold text-white/80">
                  / {currentPhase.duration}s
                </span>
              </div>
            </div>
          </div>

          {/* Step Instruction & Affirmation */}
          <div className="mt-3 mb-2 px-2">
            <p className="text-sm font-bold text-white drop-shadow-2xs">
              {currentPhase.instruction}
            </p>
            <p className="text-xs text-white/85 mt-0.5">
              {currentPhase.subtext}
            </p>
          </div>

          {/* Interactive Controls: Play/Pause, Restart, Done */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/20">
            <button
              type="button"
              onClick={togglePauseBreathing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition active:scale-95 border border-white/25 min-h-[36px]"
            >
              {breathSession.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetBreathing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95 border border-white/15 min-h-[36px]"
              title="Restart 4-7-8 sequence from Inhale (4s)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={closeBreathing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition active:scale-95 border border-white/15 min-h-[36px]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 rounded-2xl p-3.5 border border-sky-100 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white shadow-xs text-sky-600 flex items-center justify-center border border-sky-100/60">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Need a quick moment to ground yourself?
              </p>
              <p className="text-[11px] text-slate-500">
                Try 2 minutes of 4-7-8 soothing breathing (Inhale 4s, Hold 7s, Exhale 8s).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={startBreathing}
            className="text-xs font-bold text-sky-700 bg-white hover:bg-sky-100 px-3.5 py-1.5 rounded-xl border border-sky-200 transition shadow-2xs min-h-[36px]"
          >
            Start
          </button>
        </div>
      )}

      {/* Mode 1: Guided Check-In */}
      {activeMode === 'guided' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-6">
          {isCompleted ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Check-In Safely Saved 🌿
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Thank you for taking this moment for yourself. Your responses are stored confidentially and shared only with your empanelled MoSJE counsellor.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
                <button
                  onClick={() => setIsCompleted(false)}
                  className="py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl transition"
                >
                  Update Today’s Reflection
                </button>
                <button
                  onClick={() => setActiveMode('chat')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Continue Talking with Saathi
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Quick Wellbeing Check
                  </span>
                  <span className="text-xs text-slate-400">
                    No pressure • Safe & private
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-800 mt-1">
                  How has your day been feeling?
                </h2>
              </div>

              {/* Form Grid: 1 col on mobile, 2 cols on lg screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Column: Mood, Energy, Sleep */}
                <div className="space-y-5">
                  {/* Step 1: Mood */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-sky-600" />
                      <span>1. Today’s mood</span>
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {MOOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.level}
                          type="button"
                          onClick={() => setSelectedMood(opt.level)}
                          className={`p-1.5 sm:p-2.5 rounded-2xl border text-center transition active:scale-95 min-h-[58px] sm:min-h-[68px] flex flex-col items-center justify-center ${
                            selectedMood === opt.level
                              ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                              : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xl sm:text-2xl block mb-0.5">{opt.emoji}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 block leading-tight">
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Energy Slider */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>2. Physical energy & calm (1 - 5)</span>
                      </label>
                      <span className="text-xs font-bold text-sky-700 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100">
                        {energy === 1
                          ? 'Drained'
                          : energy === 2
                          ? 'Low'
                          : energy === 3
                          ? 'Moderate'
                          : energy === 4
                          ? 'Good'
                          : 'Energetic'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                      <span>Very Low</span>
                      <span>Balanced</span>
                      <span>High Energy</span>
                    </div>
                  </div>

                  {/* Step 3: Sleep Quality */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>3. How did you sleep last night?</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'good', label: 'Rested & Deep' },
                        { id: 'fair', label: 'Okay / Normal' },
                        { id: 'poor', label: 'Restless' },
                        { id: 'disturbed', label: 'Disturbed / Nightmares' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSleep(s.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                            sleep === s.id
                              ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-sm'
                              : 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Tags, Notes, and Submit */}
                <div className="space-y-5">
                  {/* Step 4: Tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">
                      4. Any specific influences today? (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {tagOptions.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional brief note */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Anything you want to write down quietly? (Optional)
                    </label>
                    <textarea
                      value={optionalNote}
                      onChange={(e) => setOptionalNote(e.target.value)}
                      placeholder="Only write if comfortable. No pressure..."
                      rows={3}
                      className="w-full p-3 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleFinishGuided}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-md shadow-sky-200 transition active:scale-95 text-xs"
                    >
                      Save Today’s Check-In
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      🔒 Confidentially synced with your empanelled MoSJE care team.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Conversational Chatbot (Saathi AI) */}
      {activeMode === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Chat Feed */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-sky-100 shadow-sm flex flex-col h-[70vh] min-h-[480px] max-h-[640px] overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-sky-50 via-sky-50/50 to-indigo-50/40 p-3.5 border-b border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-800">
                      Saathi Companion
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      Gemini 3.5 Flash
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Empathetic Support • Encrypted & Confidential
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Restart conversation"
                  className="p-1.5 rounded-xl bg-white hover:bg-sky-50 text-slate-400 hover:text-sky-600 border border-sky-100 transition shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenHelpline}
                  className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-sky-700 border border-sky-200 shadow-sm hover:bg-sky-50 transition"
                >
                  <Phone className="w-3 h-3 text-sky-600" />
                  <span>14566</span>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAFBFD]/50">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    } space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-line ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-br-xs font-medium'
                          : 'bg-white border border-sky-100/80 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>

                    <span className="text-[9px] text-slate-400 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Quick suggestion pills from bot */}
                    {!isUser && msg.quickReplies && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 pt-1">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            onClick={() => {
                              const lowerQr = qr.toLowerCase();
                              if (lowerQr.includes('breathing') || lowerQr.includes('breath')) {
                                startBreathing();
                              } else if (lowerQr.includes('14566') || lowerQr.includes('helpline')) {
                                onOpenHelpline();
                              } else if (lowerQr.includes('counsellor') || lowerQr.includes('dr. sen') || lowerQr.includes('callback')) {
                                onRequestCounsellor();
                              } else {
                                handleSendMessage(qr);
                              }
                            }}
                            className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-800 border border-sky-100 rounded-full shadow-xs transition active:scale-95"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                  <span className="text-[10px] ml-1">Saathi is reflecting...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Microcopy assurance */}
            <div className="px-4 py-1 bg-white border-t border-slate-50 text-center">
              <span className="text-[10px] text-slate-400">
                “Take your time. We’re here for you whenever you’re ready.”
              </span>
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-white border-t border-sky-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share whatever is on your mind..."
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Desktop Companion Grounding Panel */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>Grounding Anchor</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If thoughts feel racing or overwhelming right now, take 90 seconds for a quick parasympathetic reset.
              </p>
              <button
                type="button"
                onClick={startBreathing}
                className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition flex items-center justify-center gap-2"
              >
                <Wind className="w-4 h-4 text-sky-600" />
                <span>Launch 4-7-8 Breathing</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Need Direct Human Voice?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can ask for an immediate callback from your assigned trauma specialist or connect directly to the 24/7 toll-free helpline.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onRequestCounsellor}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Request Dr. Sen Callback
                </button>
                <button
                  type="button"
                  onClick={onOpenHelpline}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 14566 (MoSJE Tele-MANAS)</span>
                </button>
              </div>
            </div>

            <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100/80 text-[11px] text-sky-900 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Your conversation is processed securely by MoSJE Samvedna. All interactions are protected under the Mental Healthcare Act privacy provisions.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
