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
  CaseStage,
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
import { PatientMoodTrendGraph } from './PatientMoodTrendGraph';

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
    checkIns: firebaseCheckIns,
    addInterventionNote,
    resolveCounsellorAlert,
    addNewPatient,
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
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // Add Patient Modal State
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientCaseNumber, setNewPatientCaseNumber] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('26');
  const [newPatientIncidentType, setNewPatientIncidentType] = useState('Protection of Civil Rights & SC/ST Prevention of Atrocities Matter');
  const [newPatientStage, setNewPatientStage] = useState<CaseStage>('registration');
  const [newPatientHearingDate, setNewPatientHearingDate] = useState('18 Nov 2026');
  const [newPatientDistress, setNewPatientDistress] = useState<'Normal' | 'Moderate' | 'High'>('Moderate');
  const [newPatientContactPref, setNewPatientContactPref] = useState<'call' | 'whatsapp' | 'sms' | 'silent'>('call');
  const [newPatientPreferredTime, setNewPatientPreferredTime] = useState('10:00 AM - 1:00 PM');
  const [newPatientLanguage, setNewPatientLanguage] = useState('Hindi');
  const [newPatientOfficer, setNewPatientOfficer] = useState('Insp. R. K. Meena (Special Cell)');
  const [newPatientLegalAid, setNewPatientLegalAid] = useState('DLSA Central Delhi • Advocate Panel');
  const [newPatientInitialNote, setNewPatientInitialNote] = useState('');
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

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

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    setIsSubmittingPatient(true);
    try {
      const generatedCaseNum = newPatientCaseNumber.trim() || `MSJE/NHAA/2026/${Math.floor(1000 + Math.random() * 9000)}`;
      const created = await addNewPatient({
        complainantName: newPatientName.trim(),
        caseNumber: generatedCaseNum,
        age: parseInt(newPatientAge, 10) || 28,
        incidentType: newPatientIncidentType.trim(),
        currentStage: newPatientStage,
        nextHearingDate: newPatientHearingDate.trim() || 'Review within 30 days',
        distressLevel: newPatientDistress,
        contactPreference: newPatientContactPref,
        preferredTime: newPatientPreferredTime.trim() || '10:00 AM - 1:00 PM',
        language: newPatientLanguage.trim() || 'Hindi',
        assignedOfficer: newPatientOfficer.trim() || 'Special Cell Desk',
        districtLegalAid: newPatientLegalAid.trim() || 'DLSA Panel Advocate',
        assignedCounsellor: userProfile.name || 'Dr. Ananya Sen (MoSJE Empanelled)',
      });

      if (newPatientInitialNote.trim()) {
        await addInterventionNote(
          created.id,
          newPatientInitialNote.trim(),
          'Initial clinical baseline intake and psycho-legal triage conducted.'
        );
      }

      setSelectedCase(created);
      setRecentlyAddedId(created.id);
      setActiveTab('cases');
      setIsAddPatientOpen(false);

      // Reset form fields
      setNewPatientName('');
      setNewPatientCaseNumber('');
      setNewPatientAge('26');
      setNewPatientInitialNote('');

      setToastMessage(`Patient "${created.complainantName}" (${created.caseNumber}) successfully registered and added to Counsellor Dossier!`);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error adding patient:', err);
    } finally {
      setIsSubmittingPatient(false);
    }
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
              onClick={() => setIsAddPatientOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
              title="Add New Patient"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>

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
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Cases</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">{cases.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Active monitored complainants
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
                              if (found) {
                                setSelectedCase(found);
                                setIsPatientModalOpen(true);
                              }
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

                  {/* Recent Mood Trend (Last 7 Days) */}
                  <PatientMoodTrendGraph
                    caseData={selectedCase}
                    userCheckIns={firebaseCheckIns}
                  />

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

              <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, case #, or matter..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <button
                  onClick={() => setIsAddPatientOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition active:scale-95 shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Patient</span>
                </button>
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
                  {filteredCases.map((c) => {
                    const isNew = c.id === recentlyAddedId;
                    return (
                      <tr
                        key={c.id}
                        className={`transition ${
                          isNew ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3 px-3 font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span>{c.complainantName}</span>
                            {isNew && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                NEW
                              </span>
                            )}
                          </div>
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
                                : c.distressLevel === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
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
                              setIsPatientModalOpen(true);
                            }}
                            className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg font-bold text-xs"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                Progression across statutory procedural stages under Ministry oversight
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

      {/* Add New Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-sky-100 space-y-4 my-8 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      Register New Patient / Complainant
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      Counsellor Intake
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    MoSJE • Samvedna System Casework Dossier Intake Register
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePatient} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. Complainant Personal Profile</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Complainant Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. Anil Kumar Gautam"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="110"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Language
                    </label>
                    <select
                      value={newPatientLanguage}
                      onChange={(e) => setNewPatientLanguage(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      {['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Punjabi', 'Gujarati', 'Odia'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Contact Preference
                    </label>
                    <select
                      value={newPatientContactPref}
                      onChange={(e) => setNewPatientContactPref(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      <option value="call">Direct Voice Call</option>
                      <option value="whatsapp">WhatsApp / Messaging</option>
                      <option value="sms">SMS Notification Only</option>
                      <option value="silent">Silent Outreach (Trauma-safe)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Preferred Hours
                    </label>
                    <input
                      type="text"
                      value={newPatientPreferredTime}
                      onChange={(e) => setNewPatientPreferredTime(e.target.value)}
                      placeholder="e.g. 10:00 AM - 1:00 PM"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Case & Legal Parameters */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>2. Case & Legal Proceedings</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Case Dossier / FIR Number
                    </label>
                    <input
                      type="text"
                      value={newPatientCaseNumber}
                      onChange={(e) => setNewPatientCaseNumber(e.target.value)}
                      placeholder="Leave blank to auto-generate (e.g. MSJE/NHAA/2026/...)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Current Statutory Stage
                    </label>
                    <select
                      value={newPatientStage}
                      onChange={(e) => setNewPatientStage(e.target.value as CaseStage)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 capitalize"
                    >
                      <option value="registration">1. Registration & FIR</option>
                      <option value="investigation">2. Investigation & Charge Sheet</option>
                      <option value="trial">3. Special Court Trial</option>
                      <option value="rehabilitation">4. Rehabilitation & Livelihood</option>
                      <option value="compensation">5. Compensation & Case Closure</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Matter / Incident Category
                    </label>
                    <input
                      type="text"
                      value={newPatientIncidentType}
                      onChange={(e) => setNewPatientIncidentType(e.target.value)}
                      placeholder="e.g. Protection of Civil Rights & SC/ST Prevention of Atrocities Matter"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Next Hearing / Review Date
                    </label>
                    <input
                      type="text"
                      value={newPatientHearingDate}
                      onChange={(e) => setNewPatientHearingDate(e.target.value)}
                      placeholder="e.g. 18 Nov 2026"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Triage & Clinical Assessment */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>3. Triage & Clinical Support</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Initial Distress Level
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Normal', 'Moderate', 'High'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setNewPatientDistress(lvl)}
                          className={`py-1.5 text-center text-xs font-bold rounded-xl border transition ${
                            newPatientDistress === lvl
                              ? lvl === 'High'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : lvl === 'Moderate'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assigned Police Cell Officer
                    </label>
                    <input
                      type="text"
                      value={newPatientOfficer}
                      onChange={(e) => setNewPatientOfficer(e.target.value)}
                      placeholder="e.g. Insp. R. K. Meena"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      DLSA Legal Aid Advocate
                    </label>
                    <input
                      type="text"
                      value={newPatientLegalAid}
                      onChange={(e) => setNewPatientLegalAid(e.target.value)}
                      placeholder="e.g. DLSA Central Delhi"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                {newPatientDistress === 'High' && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      High distress selected: This will immediately generate a priority triage alert for emergency counsellor outreach.
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Initial Clinical / Triage Intake Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newPatientInitialNote}
                    onChange={(e) => setNewPatientInitialNote(e.target.value)}
                    placeholder="Enter initial observations, psychological trauma markers, safety concerns, or legal aid requests..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPatient || !newPatientName.trim()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingPatient ? 'Registering Patient...' : 'Add Patient to Dossier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details & Clinical Trajectory Modal */}
      {isPatientModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-sky-100 space-y-4 my-8 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center font-extrabold text-base">
                  {selectedCase.complainantName.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                      {selectedCase.complainantName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                      {selectedCase.currentStage} Stage
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedCase.distressLevel === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : selectedCase.distressLevel === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedCase.distressLevel} Distress
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Case No: <span className="font-semibold text-slate-700">{selectedCase.caseNumber}</span> • {selectedCase.age} Yrs • Language: {selectedCase.language}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Close dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Quick Contact & Legal Safeguard Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Contact Channel
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5 capitalize">
                    {selectedCase.contactPreference} • {selectedCase.preferredTime}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Assigned Police Cell Officer
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedCase.assignedOfficer || 'Special SC/ST Protection Cell'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    DLSA Legal Aid Counsel
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedCase.districtLegalAid || 'DLSA Panel Advocate'}
                  </p>
                </div>
              </div>

              {/* 7-Day Mood Trend Graph Component */}
              <PatientMoodTrendGraph
                caseData={selectedCase}
                userCheckIns={firebaseCheckIns}
              />

              {/* Counsellor Clinical Notes & Interventions */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Clinical Intervention & Support Notes</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingNote ? 'Cancel Form' : 'Add Intervention Note'}</span>
                  </button>
                </div>

                {/* Add Note Form in Modal */}
                {isAddingNote && (
                  <form
                    onSubmit={handleAddIntervention}
                    className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2.5 animate-in fade-in"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Clinical Session / Outreach Note
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Detail the psychosocial assessment, grounding exercises conducted, or safety review..."
                        className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Follow-up Action Taken
                      </label>
                      <input
                        type="text"
                        required
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        placeholder="e.g. Coordinated with DLSA advocate, scheduled breathing exercise call"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        Save Intervention
                      </button>
                    </div>
                  </form>
                )}

                {/* Existing Notes Log */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {interventions
                    .filter((n) => n.caseId === selectedCase.id)
                    .map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-700">
                            {note.counsellorName}
                          </span>
                          <span>{note.date}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{note.note}</p>
                        <div className="text-[10px] text-sky-800 font-semibold pt-0.5">
                          Action: {note.actionTaken}
                        </div>
                      </div>
                    ))}

                  {interventions.filter((n) => n.caseId === selectedCase.id).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No prior intervention notes logged yet for this complainant.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('overview');
                  setIsPatientModalOpen(false);
                }}
                className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
              >
                <span>Pin to Overview Dashboard →</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
