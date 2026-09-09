import React, { useState } from 'react';
import {
  Shield,
  Phone,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowRight,
  Filter,
  FileText,
  UserCheck,
  Heart,
  Calendar,
  X,
  ChevronRight,
  MessageSquare,
  Lock,
  LogOut,
  ExternalLink,
  Cloud,
} from 'lucide-react';
import {
  CaseData,
  CounsellorAlert,
  InterventionNote,
  DailyCheckInRecord,
  MoodLevel,
} from '../types';
import {
  COUNSELLOR_CASES,
  INITIAL_ALERTS,
  INITIAL_INTERVENTIONS,
  INITIAL_CHECKINS,
} from '../data/mockData';
import { useFirebase } from '../context/FirebaseContext';

interface CounsellorDashboardProps {
  onLogout: () => void;
  onOpenHelpline: () => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({
  onLogout,
  onOpenHelpline,
}) => {
  const {
    cases: firebaseCases,
    alerts: firebaseAlerts,
    interventions: firebaseInterventions,
    addInterventionNote,
    resolveCounsellorAlert,
    isFirebaseConnected,
    currentUser,
    userProfile,
  } = useFirebase();

  const cases = firebaseCases && firebaseCases.length > 0 ? firebaseCases : COUNSELLOR_CASES;
  const alerts = firebaseAlerts && firebaseAlerts.length > 0 ? firebaseAlerts : INITIAL_ALERTS;
  const interventions = firebaseInterventions && firebaseInterventions.length > 0 ? firebaseInterventions : INITIAL_INTERVENTIONS;

  const [selectedCase, setSelectedCase] = useState<CaseData | null>(cases[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'alerts' | 'trends'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Intervention Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [newActionText, setNewActionText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Resolve alert modal state
  const [resolvingAlert, setResolvingAlert] = useState<CounsellorAlert | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');

  const handleResolveAlert = async (alertId: string) => {
    await resolveCounsellorAlert(alertId, resolutionComment || 'Resolved post counsellor review and victim check-in.');
    setResolvingAlert(null);
    setResolutionComment('');
  };

  const handleAddIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCase) return;

    await addInterventionNote(
      selectedCase.id,
      newNoteText,
      newActionText || 'Scheduled follow-up contact and notified DLSA representative.'
    );

    setNewNoteText('');
    setNewActionText('');
    setIsAddingNote(false);
  };

  const filteredCases = cases.filter(
    (c) =>
      c.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.incidentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAlertsCount = alerts.filter((a) => a.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col">
      {/* Top Counsellor Web Navigation Bar */}
      <header className="bg-white border-b border-sky-100/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-800 tracking-tight">
                  MindSaathi
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Counsellor & Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MoSJE • Samvedna System with NHAA 14566 Integration
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Firebase Synced</span>
            </div>

            <button
              onClick={onOpenHelpline}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>NHAA 14566 Desk</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 border border-slate-200"
              title="Sign Out of Counsellor Dashboard"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                {currentUser?.displayName
                  ? currentUser.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AS'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800">
                  {currentUser?.displayName || userProfile.name || 'Dr. Ananya Sen'}
                </p>
                <p className="text-[10px] text-slate-400">MoSJE Counsellor / Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Nav Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 border-t border-slate-100 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Dashboard Overview' },
            { id: 'cases', label: `Casework Dossier (${cases.length})` },
            { id: 'alerts', label: `Active Alerts (${openAlertsCount})` },
            { id: 'trends', label: 'Distress & Wellbeing Trends' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 relative transition ${
                activeTab === tab.id
                  ? 'text-sky-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Cases</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">142</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Active across Delhi NCR & Regions
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Cases Needing Attention
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-rose-600 mt-2">
              {openAlertsCount}
            </p>
            <p className="text-[11px] text-rose-700 font-medium mt-1">
              High distress / missed check-in
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Weekly Check-In Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 mt-2">88.4%</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ↑ 6% higher adherence
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Resolved Interventions
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-indigo-900 mt-2">94</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              Recorded under MoSJE protocols
            </p>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Graphs & Flagged Cases */}
            <div className="lg:col-span-2 space-y-6">
              {/* Distress & Wellbeing 7-Day Trend Chart */}
              <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-sky-600" />
                      <span>7-Day Aggregated Complainant Wellbeing Index</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Normalized score (1–10) across active cases under trauma recovery
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-sky-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      Wellbeing Score
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      Distress Threshold
                    </span>
                  </div>
                </div>

                {/* Clean Responsive SVG Chart */}
                <div className="h-56 w-full pt-2">
                  <svg
                    viewBox="0 0 600 200"
                    className="w-full h-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Distress threshold reference line */}
                    <line
                      x1="40"
                      y1="140"
                      x2="580"
                      y2="140"
                      stroke="#f87171"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text x="45" y="135" fill="#ef4444" fontSize="10" fontWeight="bold">
                      Critical Distress Level
                    </text>

                    {/* Area under curve */}
                    <path
                      d="M 60,135 Q 140,150 220,110 T 380,85 T 540,55 L 540,170 L 60,170 Z"
                      fill="url(#areaGradient)"
                    />

                    {/* Primary Curve */}
                    <path
                      d="M 60,135 Q 140,150 220,110 T 380,85 T 540,55"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {[
                      { x: 60, y: 135, day: 'Mon', val: '4.8' },
                      { x: 140, y: 145, day: 'Tue', val: '4.5' },
                      { x: 220, y: 110, day: 'Wed', val: '5.9' },
                      { x: 300, y: 95, day: 'Thu', val: '6.4' },
                      { x: 380, y: 85, day: 'Fri', val: '6.8' },
                      { x: 460, y: 70, day: 'Sat', val: '7.3' },
                      { x: 540, y: 55, day: 'Sun', val: '7.9' },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill="#ffffff"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                        />
                        <text
                          x={pt.x}
                          y="190"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {pt.day}
                        </text>
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {pt.val}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Flagged Cases / Cases Needing Attention */}
              <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Flagged Cases Requiring Outreach
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Sorted by triage urgency
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {alerts
                    .filter((a) => a.status !== 'Resolved')
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-2xl transition"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                alert.severity === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {alert.severity} Priority
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {alert.complainantName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({alert.caseNumber})
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {alert.reason}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            Logged: {alert.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const found = cases.find((c) => c.id === alert.caseId);
                              if (found) setSelectedCase(found);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition"
                          >
                            Open Dossier
                          </button>
                          <button
                            onClick={() => setResolvingAlert(alert)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column: Selected Case Details & Intervention Notes */}
            <div className="space-y-6">
              {selectedCase && (
                <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
                  {/* Case Header */}
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                        {selectedCase.currentStage} Stage
                      </span>
                      <span className="text-xs text-slate-400">
                        Hearing: {selectedCase.nextHearingDate}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 mt-1">
                      {selectedCase.complainantName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedCase.caseNumber} • {selectedCase.age} Yrs
                    </p>
                  </div>

                  {/* Vitals */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Contact Preference
                      </span>
                      <span className="font-bold text-slate-700 uppercase">
                        {selectedCase.contactPreference} ({selectedCase.preferredTime})
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Distress Tier
                      </span>
                      <span
                        className={`font-bold ${
                          selectedCase.distressLevel === 'High'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {selectedCase.distressLevel}
                      </span>
                    </div>
                  </div>

                  {/* Compensation Summary */}
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                    <p className="font-bold text-emerald-900">
                      PoA Victim Relief Status:
                    </p>
                    <div className="flex justify-between text-[11px] text-emerald-800">
                      <span>Interim Disbursed:</span>
                      <strong>{selectedCase.compensationStatus.interimDisbursed}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-emerald-800">
                      <span>Total Eligible:</span>
                      <strong>{selectedCase.compensationStatus.totalEligible}</strong>
                    </div>
                  </div>

                  {/* Intervention Notes Log */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Counsellor Intervention Notes</span>
                      </h4>
                      <button
                        onClick={() => setIsAddingNote(true)}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Note
                      </button>
                    </div>

                    {/* New Note Form */}
                    {isAddingNote && (
                      <form
                        onSubmit={handleAddIntervention}
                        className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2.5 animate-in fade-in"
                      >
                        <textarea
                          required
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Document counselling session observation, victim emotional state, or safe disclosures..."
                          rows={3}
                          className="w-full p-2.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                        <input
                          type="text"
                          value={newActionText}
                          onChange={(e) => setNewActionText(e.target.value)}
                          placeholder="Action taken (e.g., Coordinated with DLSA, scheduled call)..."
                          className="w-full p-2 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsAddingNote(false)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs"
                          >
                            Save Note
                          </button>
                        </div>
                      </form>
                    )}

                    {/* List of Notes */}
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {interventions
                        .filter((n) => n.caseId === selectedCase.id)
                        .map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                              <span>{note.counsellorName}</span>
                              <span>{note.date}</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-normal">
                              {note.note}
                            </p>
                            <div className="pt-1 text-[10px] text-sky-800 font-semibold">
                              Action: {note.actionTaken}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Casework Dossier Table */}
        {activeTab === 'cases' && (
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  All Monitored Complainants Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  MoSJE victim mental health and legal progression register
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, case #, or matter..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Complainant</th>
                    <th className="py-3 px-3">Case ID</th>
                    <th className="py-3 px-3">Current Stage</th>
                    <th className="py-3 px-3">Next Hearing</th>
                    <th className="py-3 px-3">Distress Status</th>
                    <th className="py-3 px-3">Contact Pref</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {c.complainantName}
                        <span className="block text-[10px] font-normal text-slate-400">
                          {c.age} Yrs • {c.language}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {c.caseNumber}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 capitalize">
                          {c.currentStage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {c.nextHearingDate}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.distressLevel === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.distressLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-semibold text-slate-600">
                        {c.contactPreference}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActiveTab('overview');
                          }}
                          className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg font-bold text-xs"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Alert Management View */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Alert Management & Triage Center
                </h3>
                <p className="text-xs text-slate-500">
                  Automated risk indicators triggered by check-ins, keywords, or distress patterns
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-sky-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.severity === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : alert.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">
                        {alert.complainantName} ({alert.caseNumber})
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        • {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{alert.reason}</p>
                    {alert.resolutionNotes && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                        Resolution Note: {alert.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.status === 'Resolved' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => setResolvingAlert(alert)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Distress & Wellbeing Trends Detailed Analytics */}
        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Current Mood Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Breakdown of emotions logged across all 142 complainants this week
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Great 😊', count: 32, pct: '23%', color: 'bg-emerald-500' },
                  { label: 'Good 🙂', count: 54, pct: '38%', color: 'bg-sky-500' },
                  { label: 'Okay 😐', count: 34, pct: '24%', color: 'bg-amber-400' },
                  { label: 'Low 😔', count: 15, pct: '11%', color: 'bg-orange-400' },
                  { label: 'Very Low 😢', count: 7, pct: '4%', color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span>
                        {item.count} cases ({item.pct})
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: item.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                PoA Stage Casework Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Progression across statutory milestones under Ministry oversight
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { stage: '1. Registration & FIR', count: 18, pct: '13%' },
                  { stage: '2. Investigation & Charge Sheet', count: 34, pct: '24%' },
                  { stage: '3. Special Court Trial', count: 62, pct: '44%' },
                  { stage: '4. Rehabilitation & Livelihood', count: 16, pct: '11%' },
                  { stage: '5. Compensation & Case Closure', count: 12, pct: '8%' },
                ].map((st) => (
                  <div
                    key={st.stage}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800">
                      {st.stage}
                    </span>
                    <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      {st.count} ({st.pct})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Resolve Alert Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-sky-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Resolution Protocol
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">
                  Resolve Alert: {resolvingAlert.complainantName}
                </h3>
              </div>
              <button
                onClick={() => setResolvingAlert(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Trigger reason: <strong>{resolvingAlert.reason}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Resolution & Follow-up Note:
              </label>
              <textarea
                value={resolutionComment}
                onChange={(e) => setResolutionComment(e.target.value)}
                placeholder="Detail the outcome of phone outreach, victim safety confirmation, or counselling provided..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingAlert(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveAlert(resolvingAlert.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
