import React from 'react';
import {
  Heart,
  Phone,
  Shield,
  ArrowRight,
  Sparkles,
  BookOpen,
  UserCheck,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  Smile,
} from 'lucide-react';
import { MoodBoard } from './MoodBoard';
import { CaseData, MoodLevel, ResourceItem } from '../types';
import { MOOD_OPTIONS, RESOURCES_DATA } from '../data/mockData';

interface HomeDashboardProps {
  userName: string;
  caseData: CaseData;
  currentMood: MoodLevel;
  onSelectMood: (mood: MoodLevel, message: string) => void;
  onNavigateTab: (tab: 'home' | 'checkin' | 'case' | 'resources' | 'profile') => void;
  onOpenHelpline: () => void;
  onRequestCounsellor: () => void;
  onOpenResource: (resource: ResourceItem) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userName,
  caseData,
  currentMood,
  onSelectMood,
  onNavigateTab,
  onOpenHelpline,
  onRequestCounsellor,
  onOpenResource,
}) => {
  const currentMoodObj = MOOD_OPTIONS.find((m) => m.level === currentMood) || MOOD_OPTIONS[2];

  // Recommended resources
  const recommended = RESOURCES_DATA.slice(0, 2);

  return (
    <div className="w-full pb-24 space-y-5 animate-in fade-in duration-300">
      {/* Top Banner & Official MoSJE Liaison */}
      <div className="bg-gradient-to-r from-sky-100/90 via-sky-50 to-[#FAF7F2] rounded-3xl p-5 border border-sky-100/80 shadow-sm relative overflow-hidden">
        {/* Soft abstract sun/plant backdrop illustration */}
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-sky-200/40 blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 opacity-15 text-sky-800 pointer-events-none">
          <Sparkles className="w-16 h-16" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>MoSJE • Samvedna Portal</span>
            </div>
            <button
              onClick={onOpenHelpline}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-sky-700 border border-sky-200 shadow-sm transition"
            >
              <Phone className="w-3 h-3 text-sky-600" />
              <span>NHAA 14566</span>
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Namaste, {userName} 🌸
          </h1>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-sm">
            You are in a safe, secure space. Take things one breath at a time today.
          </p>

          {/* Quick Check-In CTA Button */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('checkin')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition active:scale-95"
            >
              <Smile className="w-4 h-4" />
              <span>Start Daily Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('checkin')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Chat with Saathi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mood Board Component */}
      <MoodBoard
        currentMood={currentMood}
        onSelectMood={onSelectMood}
        onOpenHelpline={onOpenHelpline}
      />

      {/* Simple Wellbeing Status & Streak */}
      <div className="bg-white/95 rounded-3xl p-5 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Heart className="w-4 h-4 text-sky-600 fill-sky-100" />
            <span>Wellbeing Reflection</span>
          </h2>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            3-Day Streak 🌿
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
            <p className="text-[11px] text-slate-400 font-medium">Current State</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{currentMoodObj.emoji}</span>
              <span className="text-xs font-bold text-slate-700">
                {currentMoodObj.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Logged today</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
            <p className="text-[11px] text-slate-400 font-medium">Emotional Safety</p>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">Protected</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Counsellor active</p>
          </div>
        </div>
      </div>

      {/* Counsellor / Help Option & NHAA 14566 Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Counsellor Card */}
        <div className="bg-white rounded-3xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Assigned Counsellor
                </p>
                <p className="text-[10px] text-slate-500">
                  {caseData.assignedCounsellor}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Request a gentle check-in call or share an update at your preferred time.
            </p>
          </div>

          <button
            onClick={onRequestCounsellor}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Request Call / Session</span>
          </button>
        </div>

        {/* NHAA 14566 Helpline Option */}
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-4 text-white shadow-md shadow-sky-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
                Govt. Helpline
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                Toll-Free 24x7
              </span>
            </div>
            <h3 className="text-base font-extrabold">NHAA 14566</h3>
            <p className="text-[11px] text-sky-100 mt-1 leading-relaxed mb-3">
              National Helpline Against Atrocities. Instant crisis response & legal aid.
            </p>
          </div>

          <button
            onClick={onOpenHelpline}
            className="w-full py-2 px-3 rounded-xl bg-white text-sky-700 hover:bg-sky-50 text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Connect to 14566</span>
          </button>
        </div>
      </div>

      {/* Recommended Resources */}
      <div className="bg-white/95 rounded-3xl p-5 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Recommended for You
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('resources')}
            className="text-xs font-bold text-sky-700 hover:text-sky-800"
          >
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {recommended.map((res) => (
            <div
              key={res.id}
              onClick={() => onOpenResource(res)}
              className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-sky-50/60 border border-slate-100 hover:border-sky-200 cursor-pointer transition flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                  {res.categoryLabel}
                </span>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-sky-900 transition leading-snug">
                  {res.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {res.summary}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 mt-2 transition" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
