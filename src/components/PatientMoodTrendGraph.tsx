import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Heart,
  Calendar,
  Zap,
  Moon,
  Info,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { CaseData, DailyCheckInRecord, MoodLevel } from '../types';

interface PatientMoodTrendGraphProps {
  caseData: CaseData;
  userCheckIns?: DailyCheckInRecord[];
}

interface DayTrendPoint {
  id: string;
  dayLabel: string;
  dateLabel: string;
  fullDate: string;
  mood: MoodLevel;
  score: number; // 1 to 5
  energyLevel: number; // 1 to 5
  sleepQuality: 'good' | 'fair' | 'poor' | 'disturbed';
  notes: string;
  tags: string[];
  flaggedForCounsellor: boolean;
}

const MOOD_TO_SCORE: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  very_low: 1,
};

const SCORE_TO_DETAILS: Record<
  number,
  { label: string; emoji: string; color: string; border: string; bg: string; stroke: string }
> = {
  5: {
    label: 'Great',
    emoji: '😊',
    color: 'text-emerald-700',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    stroke: '#10b981',
  },
  4: {
    label: 'Good',
    emoji: '🙂',
    color: 'text-sky-700',
    border: 'border-sky-300',
    bg: 'bg-sky-50',
    stroke: '#0ea5e9',
  },
  3: {
    label: 'Okay',
    emoji: '😐',
    color: 'text-amber-700',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    stroke: '#f59e0b',
  },
  2: {
    label: 'Low',
    emoji: '😔',
    color: 'text-orange-700',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    stroke: '#f97316',
  },
  1: {
    label: 'Very Low',
    emoji: '😢',
    color: 'text-rose-700',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
    stroke: '#ef4444',
  },
};

export const PatientMoodTrendGraph: React.FC<PatientMoodTrendGraphProps> = ({
  caseData,
  userCheckIns = [],
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to today (index 6)
  const [viewMetric, setViewMetric] = useState<'mood' | 'combined'>('mood');

  // Generate tailored 7-day dataset for this patient
  const trendData: DayTrendPoint[] = useMemo(() => {
    const today = new Date();
    const days: DayTrendPoint[] = [];

    // Weekday names
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Profiles of mock responses based on case characteristics
    const isHighDistress = caseData.distressLevel === 'High';
    const isModerateDistress = caseData.distressLevel === 'Moderate';

    // Baseline mood curve patterns based on case distress
    const highDistressPattern = [
      { score: 2, energy: 2, sleep: 'poor' as const, note: 'Intense flashback and headache; stayed indoors.', flag: true },
      { score: 1, energy: 1, sleep: 'disturbed' as const, note: 'Severe insomnia after receiving judicial notice.', flag: true },
      { score: 2, energy: 2, sleep: 'poor' as const, note: 'Spoke with DLSA legal aid; mild reassurance.', flag: false },
      { score: 2, energy: 3, sleep: 'fair' as const, note: 'Attended local primary health clinic for medication.', flag: false },
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Listened to MoSJE grounding audio exercise twice.', flag: false },
      { score: 2, energy: 2, sleep: 'poor' as const, note: 'Apprehensive about upcoming witness deposition.', flag: true },
      { score: 2, energy: 2, sleep: 'fair' as const, note: 'Followed routine; waiting for counsellor callback.', flag: false },
    ];

    const moderateDistressPattern = [
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Routine chores; mild persistent tension.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Comfortable family discussion, felt hopeful.', flag: false },
      { score: 2, energy: 2, sleep: 'poor' as const, note: 'Troubled sleep following discussion of case events.', flag: true },
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Completed 5-minute breathing session on Health Matrix.', flag: false },
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Spoke with DLSA advocate regarding documents.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Session with counsellor felt grounding and validating.', flag: false },
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Calm morning; taking one day at a time.', flag: false },
    ];

    const normalDistressPattern = [
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Stable day; focused on household responsibilities.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Walked in park, feeling supported.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Positive interactions with supportive relatives.', flag: false },
      { score: 3, energy: 3, sleep: 'fair' as const, note: 'Routine day; peaceful evening.', flag: false },
      { score: 5, energy: 5, sleep: 'good' as const, note: 'Very good mood after positive rehabilitation update.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Completed daily check-in with high confidence.', flag: false },
      { score: 4, energy: 4, sleep: 'good' as const, note: 'Feeling secure and emotionally steady today.', flag: false },
    ];

    const pattern = isHighDistress
      ? highDistressPattern
      : isModerateDistress
      ? moderateDistressPattern
      : normalDistressPattern;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayIndex = 6 - i; // 0 to 6

      const dayName = i === 0 ? 'Today' : i === 1 ? 'Yest.' : weekdayNames[d.getDay()];
      const dateLabel = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const fullDate = d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      // Check if user has real matching check-in
      const matchedCheckIn = userCheckIns.find((c) => {
        if (i === 0 && (c.date === 'Today' || c.date?.includes('Today'))) return true;
        if (i === 1 && (c.date === 'Yesterday' || c.date?.includes('Yesterday'))) return true;
        if (c.date && c.date.includes(`${i} days ago`)) return true;
        return false;
      });

      if (matchedCheckIn && matchedCheckIn.mood) {
        const score = MOOD_TO_SCORE[matchedCheckIn.mood] || 3;
        days.push({
          id: `pt-${dayIndex}`,
          dayLabel: dayName,
          dateLabel,
          fullDate,
          mood: matchedCheckIn.mood,
          score,
          energyLevel: matchedCheckIn.energyLevel || pattern[dayIndex].energy,
          sleepQuality: matchedCheckIn.sleepQuality || pattern[dayIndex].sleep,
          notes: matchedCheckIn.notes || pattern[dayIndex].note,
          tags: matchedCheckIn.tags || ['Health Matrix Log'],
          flaggedForCounsellor: Boolean(matchedCheckIn.flaggedForCounsellor || matchedCheckIn.mood === 'very_low'),
        });
      } else {
        const base = pattern[dayIndex];
        const moodKey = (
          base.score === 5
            ? 'great'
            : base.score === 4
            ? 'good'
            : base.score === 3
            ? 'okay'
            : base.score === 2
            ? 'low'
            : 'very_low'
        ) as MoodLevel;

        days.push({
          id: `pt-${dayIndex}`,
          dayLabel: dayName,
          dateLabel,
          fullDate,
          mood: moodKey,
          score: base.score,
          energyLevel: base.energy,
          sleepQuality: base.sleep,
          notes: base.note,
          tags: base.flag ? ['Distress Flag', 'Psychological Support'] : ['Daily Reflection'],
          flaggedForCounsellor: base.flag,
        });
      }
    }

    return days;
  }, [caseData.distressLevel, userCheckIns]);

  // Calculations for summary stats
  const averageMood = useMemo(() => {
    const sum = trendData.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / trendData.length).toFixed(1);
  }, [trendData]);

  const averageEnergy = useMemo(() => {
    const sum = trendData.reduce((acc, curr) => acc + curr.energyLevel, 0);
    return (sum / trendData.length).toFixed(1);
  }, [trendData]);

  const flagsCount = useMemo(() => {
    return trendData.filter((d) => d.flaggedForCounsellor || d.score <= 2).length;
  }, [trendData]);

  const trendDelta = useMemo(() => {
    const firstHalfAvg = (trendData[0].score + trendData[1].score + trendData[2].score) / 3;
    const secondHalfAvg = (trendData[4].score + trendData[5].score + trendData[6].score) / 3;
    return secondHalfAvg - firstHalfAvg;
  }, [trendData]);

  const selectedDay = trendData[selectedDayIndex] || trendData[trendData.length - 1];
  const selectedDetails = SCORE_TO_DETAILS[selectedDay.score];

  // SVG Chart Dimensions & Math
  const svgWidth = 460;
  const svgHeight = 150;
  const paddingLeft = 32;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Y axis scale: score 1 at bottom, score 5 at top
  const getY = (score: number) => {
    // 5 -> paddingTop, 1 -> paddingTop + chartH
    const normalized = (score - 1) / 4; // 0 (score 1) to 1 (score 5)
    return paddingTop + chartH - normalized * chartH;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / 6) * chartW;
  };

  // Generate smooth SVG curve points
  const points = trendData.map((d, i) => ({ x: getX(i), y: getY(d.score), ...d }));
  const energyPoints = trendData.map((d, i) => ({ x: getX(i), y: getY(d.energyLevel), ...d }));

  // Create SVG path string for mood curve
  const curvePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Create SVG area fill path (closes down to bottom of chart)
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingTop + chartH;
    let d = `M ${points[0].x} ${bottomY} L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${bottomY} Z`;
    return d;
  }, [points, chartH]);

  // Energy Line Path
  const energyPath = useMemo(() => {
    if (energyPoints.length === 0) return '';
    let d = `M ${energyPoints[0].x} ${energyPoints[0].y}`;
    for (let i = 0; i < energyPoints.length - 1; i++) {
      const p0 = energyPoints[i];
      const p1 = energyPoints[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [energyPoints]);

  return (
    <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3.5">
      {/* Header with Title & Quick Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
            <Heart className="w-4 h-4 text-sky-600 fill-sky-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 tracking-tight">
                Recent Mood Trend (Last 7 Days)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Daily Check-Ins
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Psychological trajectory & emotional stability monitoring
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100/90 p-0.5 rounded-xl text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setViewMetric('mood')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMetric === 'mood'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mood Curve
          </button>
          <button
            type="button"
            onClick={() => setViewMetric('combined')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMetric === 'combined'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mood + Energy
          </button>
        </div>
      </div>

      {/* Analytics Summary Badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80">
          <span className="text-[9px] font-semibold uppercase text-slate-400 block tracking-wider">
            7-Day Avg Mood
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-extrabold text-slate-800">
              {averageMood}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">/ 5.0</span>
            <span className="text-sm">
              {parseFloat(averageMood) >= 4 ? '🙂' : parseFloat(averageMood) >= 3 ? '😐' : '😔'}
            </span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80">
          <span className="text-[9px] font-semibold uppercase text-slate-400 block tracking-wider">
            Trajectory
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {trendDelta > 0.3 ? (
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Improving
              </span>
            ) : trendDelta < -0.3 ? (
              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> Volatile
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-0.5">
                <Minus className="w-3.5 h-3.5 text-slate-400" /> Stabilized
              </span>
            )}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/80">
          <span className="text-[9px] font-semibold uppercase text-slate-400 block tracking-wider">
            Flags & Alerts
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {flagsCount > 0 ? (
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {flagsCount} flagged days
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700">
                ✓ No crisis alerts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="relative w-full bg-slate-50/60 rounded-xl p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Soft gradient fill under curve */}
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines for each score level 1 to 5 */}
          {[5, 4, 3, 2, 1].map((lvl) => {
            const y = getY(lvl);
            return (
              <g key={lvl} className="text-[9px] font-medium text-slate-300">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke={lvl === 3 ? '#cbd5e1' : '#e2e8f0'}
                  strokeDasharray={lvl === 3 ? '2 2' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[8px] font-semibold"
                >
                  {lvl}
                </text>
              </g>
            );
          })}

          {/* Area Fill Under Mood Curve */}
          <path d={areaPath} fill="url(#moodGradient)" />

          {/* Optional Energy Line (in combined mode) */}
          {viewMetric === 'combined' && (
            <path
              d={energyPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
          )}

          {/* Main Mood Spline Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Interactive Data Point Markers */}
          {points.map((pt, index) => {
            const isSelected = index === selectedDayIndex;
            const details = SCORE_TO_DETAILS[pt.score];

            return (
              <g
                key={pt.id}
                className="cursor-pointer group"
                onClick={() => setSelectedDayIndex(index)}
              >
                {/* Vertical guide on hover / selected */}
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + chartH}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Large transparent touch hit target for mobile fingers */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Flag pulse circle if day had crisis or distress */}
                {pt.flaggedForCounsellor && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 10 : 8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Point Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6.5 : 4.5}
                  fill="#ffffff"
                  stroke={details.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200"
                />

                {/* Point Inner Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 2.5 : 1.5}
                  fill={details.stroke}
                />

                {/* X-axis Day Labels */}
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={`text-[9px] font-bold transition ${
                    isSelected ? 'fill-sky-800' : 'fill-slate-500'
                  }`}
                >
                  {pt.dayLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-1 bg-sky-600 rounded-full inline-block" />
              Mood Score (1-5)
            </span>
            {viewMetric === 'combined' && (
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-amber-500 inline-block" />
                Energy Level (1-5)
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400">Tap points to inspect day</span>
        </div>
      </div>

      {/* Selected Day Inspection Card */}
      <div className={`p-3 rounded-xl border ${selectedDetails.border} ${selectedDetails.bg} text-xs space-y-2 transition animate-in fade-in duration-200`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{selectedDetails.emoji}</span>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-extrabold text-slate-800">
                  {selectedDetails.label} (Level {selectedDay.score}/5)
                </span>
                {selectedDay.flaggedForCounsellor && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> High Distress Flag
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {selectedDay.fullDate} ({selectedDay.dayLabel})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 border border-slate-200/60 shadow-2xs">
              <Zap className="w-3 h-3 text-amber-500" />
              Energy: {selectedDay.energyLevel}/5
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 border border-slate-200/60 shadow-2xs capitalize">
              <Moon className="w-3 h-3 text-indigo-500" />
              Sleep: {selectedDay.sleepQuality}
            </span>
          </div>
        </div>

        {/* Check-In Journal Note */}
        <div className="p-2 rounded-lg bg-white/90 border border-slate-200/60 text-slate-700 text-[11px] leading-relaxed">
          <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider mb-0.5 text-slate-400">
            Complainant Journal Entry:
          </span>
          <p className="italic">"{selectedDay.notes}"</p>
        </div>

        {/* Tags */}
        {selectedDay.tags && selectedDay.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {selectedDay.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-white/80 text-slate-600 border border-slate-200/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
