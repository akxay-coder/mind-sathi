import React, { useState } from 'react';
import { Heart, Sparkles, Check, Phone } from 'lucide-react';
import { MOOD_OPTIONS } from '../data/mockData';
import { MoodLevel } from '../types';

interface MoodBoardProps {
  currentMood?: MoodLevel;
  onSelectMood: (mood: MoodLevel, supportiveMsg: string) => void;
  onOpenHelpline?: () => void;
}

export const MoodBoard: React.FC<MoodBoardProps> = ({
  currentMood = 'okay',
  onSelectMood,
  onOpenHelpline,
}) => {
  const [selected, setSelected] = useState<MoodLevel>(currentMood);
  const [supportMessage, setSupportMessage] = useState<string>(
    MOOD_OPTIONS.find((m) => m.level === currentMood)?.response ||
      'Thank you for sharing. We’re here with you. 💙'
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelect = (level: MoodLevel) => {
    setSelected(level);
    const option = MOOD_OPTIONS.find((m) => m.level === level);
    const message = option ? option.response : 'Thank you for sharing. We’re here with you. 💙';
    setSupportMessage(message);
    setShowConfirmation(true);
    onSelectMood(level, message);
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            How are you feeling right now?
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          One-tap check
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Choose whatever feels closest. There is no right or wrong answer.
      </p>

      {/* Emoji Row / Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {MOOD_OPTIONS.map((item) => {
          const isSelected = selected === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => handleSelect(item.level)}
              className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border transition-all transform active:scale-95 min-h-[64px] sm:min-h-[76px] ${
                isSelected
                  ? 'bg-sky-50 border-sky-300 shadow-md ring-2 ring-sky-200 scale-102'
                  : 'bg-slate-50/70 border-slate-100 hover:bg-sky-50/50 hover:border-sky-100'
              }`}
            >
              <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow-2xs select-none transition-transform hover:scale-110">
                {item.emoji}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-semibold tracking-tight text-center leading-tight ${
                  isSelected ? 'text-sky-900' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Gentle Supportive Message Card */}
      {showConfirmation && (
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-blue-50/90 border border-sky-100 animate-in fade-in duration-300">
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 fill-sky-200" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {supportMessage}
              </p>
              {(selected === 'low' || selected === 'very_low') && onOpenHelpline && (
                <button
                  onClick={onOpenHelpline}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 hover:text-sky-800 mt-1 underline"
                >
                  <Phone className="w-3 h-3" /> Connect with free NHAA 14566 support
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
