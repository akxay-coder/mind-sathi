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
} from 'lucide-react';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodLevel, ChatMessage, DailyCheckInRecord } from '../types';

interface DailyCheckInProps {
  onSaveCheckIn: (checkIn: Partial<DailyCheckInRecord>) => void;
  onOpenHelpline: () => void;
  onRequestCounsellor: () => void;
}

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

  // Breathing exercise modal / widget
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

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

  // Breathing cycle animation
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return breathPhase === 'Inhale' ? 7 : breathPhase === 'Hold' ? 8 : 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

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

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Contextual empathetic responses
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Thank you for sharing that with me. Your feelings are completely valid, and you are doing the best you can. 💙';
      let replies: string[] = ['Tell me more', 'I feel a bit better', 'Breathing practice'];

      const lower = text.toLowerCase();
      if (lower.includes('court') || lower.includes('hearing') || lower.includes('case') || lower.includes('trial')) {
        replyText =
          'It is completely natural to feel nervous about upcoming legal steps. Remember that you have the right to in-camera hearings and your DLSA legal aid advocate will be by your side. Would you like to do a quick 2-minute grounding exercise?';
        replies = ['Yes, start breathing exercise', 'Tell me my victim rights', 'Remind me of hearing date'];
      } else if (lower.includes('breath') || lower.includes('anxious') || lower.includes('panic')) {
        setIsBreathingActive(true);
        replyText =
          'I have opened the guided breathing bubble above. Let’s take 4 seconds to inhale calm, hold gently for 7, and exhale tension for 8. We’re here with you.';
        replies = ['Feeling calmer now', 'Connect to counsellor'];
      } else if (lower.includes('14566') || lower.includes('helpline') || lower.includes('call') || lower.includes('counsellor')) {
        replyText =
          'You can connect directly with the MoSJE NHAA 14566 team 24 hours a day, completely free of charge. Your designated counsellor Dr. Ananya Sen is also available for a confidential callback.';
        replies = ['Dial NHAA 14566 Now', 'Request Dr. Sen callback'];
      } else if (lower.includes('sleep') || lower.includes('night') || lower.includes('tired')) {
        replyText =
          'Sleep can be hard when the mind is carrying so much. Try to soften your shoulders and release your jaw right now. Even resting your eyes without pressure helps restore your body.';
        replies = ['Show sleep tips', 'Try breathing exercise'];
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: replyText,
          timestamp: 'Just now',
          quickReplies: replies,
        },
      ]);
    }, 1200);
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

      {/* Guided Breathing Circle Card (Toggled or accessible anytime) */}
      {isBreathingActive ? (
        <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-sky-200/50 relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase font-bold text-sky-100 tracking-wider">
              4-7-8 Somatic Calming Circle
            </span>
            <button
              onClick={() => setIsBreathingActive(false)}
              className="text-xs text-sky-200 hover:text-white underline font-semibold"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-sky-100 max-w-xs mx-auto mb-5">
            Follow the gentle rhythm. Breathe in comfort, release stress.
          </p>

          <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-3">
            <div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'scale-110 bg-white/25 border-4 border-white/60'
                  : breathPhase === 'Hold'
                  ? 'scale-105 bg-white/20 border-4 border-amber-200/60'
                  : 'scale-90 bg-white/10 border-2 border-white/30'
              }`}
            />
            <div className="relative z-10">
              <span className="text-xl font-bold tracking-tight block">
                {breathPhase}
              </span>
              <span className="text-3xl font-extrabold block mt-0.5">
                {breathTimer}s
              </span>
            </div>
          </div>

          <p className="text-xs text-sky-100 italic mt-3">
            “You are safe in this moment. We are holding space for you.”
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/60 rounded-2xl p-3 border border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm text-sky-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Need a quick moment to ground yourself?
              </p>
              <p className="text-[11px] text-slate-500">
                Try 2 minutes of 4-7-8 soothing breathing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBreathingActive(true)}
            className="text-xs font-bold text-sky-700 bg-white hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition"
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

              {/* Step 1: Mood */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Today’s mood</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setSelectedMood(opt.level)}
                      className={`p-2.5 rounded-2xl border text-center transition active:scale-95 ${
                        selectedMood === opt.level
                          ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                          : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{opt.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-700 block">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

              {/* Step 4: Tags */}
              <div className="space-y-2 pt-1">
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
                  rows={2}
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
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Conversational Chatbot (Saathi AI) */}
      {activeMode === 'chat' && (
        <div className="bg-white rounded-3xl border border-sky-100 shadow-sm flex flex-col h-[560px] overflow-hidden">
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
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Empathetic Support • Encrypted & Confidential
                </p>
              </div>
            </div>

            <button
              onClick={onOpenHelpline}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-sky-700 border border-sky-200 shadow-sm"
            >
              <Phone className="w-3 h-3 text-sky-600" />
              <span>14566</span>
            </button>
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
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
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
                            if (qr.includes('Breathing') || qr.includes('breathing')) {
                              setIsBreathingActive(true);
                            } else if (qr.includes('14566')) {
                              onOpenHelpline();
                            } else if (qr.includes('counsellor')) {
                              onRequestCounsellor();
                            } else {
                              handleSendMessage(qr);
                            }
                          }}
                          className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-800 border border-sky-100 rounded-full shadow-xs transition"
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
      )}
    </div>
  );
};
