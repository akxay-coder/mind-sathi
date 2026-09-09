import React, { useState, useEffect } from 'react';
import {
  Shield,
  Phone,
  Sparkles,
  Heart,
  Cloud,
} from 'lucide-react';
import { FirebaseProvider, useFirebase } from './context/FirebaseContext';
import { AuthScreen } from './components/AuthScreen';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { DailyCheckIn } from './components/DailyCheckIn';
import { CaseStatusView } from './components/CaseStatusView';
import { ResourcesView } from './components/ResourcesView';
import { ProfileView } from './components/ProfileView';
import { CounsellorDashboard } from './components/CounsellorDashboard';
import { NHAAHelplineModal } from './components/NHAAHelplineModal';
import { CaseData, MoodLevel, ResourceItem, DailyCheckInRecord } from './types';

function MainAppContent() {
  const {
    currentUser,
    authLoading,
    isFirebaseConnected,
    userRole,
    userProfile,
    currentCase,
    saveDailyCheckIn,
    updateUserProfile,
    logout,
    setUserRole,
  } = useFirebase();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Complainant mobile tabs: 'home' | 'checkin' | 'case' | 'resources' | 'profile'
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Active mood state
  const [currentMood, setCurrentMood] = useState<MoodLevel>('okay');

  // Modals & triggers
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [counsellorRequestToast, setCounsellorRequestToast] = useState<string | null>(null);

  // Sync auth state if Firebase auth resolves a logged-in user
  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const handleLoginSuccess = (role: 'complainant' | 'counsellor') => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentTab('home');
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setCurrentTab('home');
  };

  const handleSelectMood = (mood: MoodLevel, supportiveMsg: string) => {
    setCurrentMood(mood);
  };

  const handleSaveCheckIn = async (checkIn: Partial<DailyCheckInRecord>) => {
    if (checkIn.mood) {
      setCurrentMood(checkIn.mood);
    }
    await saveDailyCheckIn(checkIn);
    setCounsellorRequestToast('Check-in logged securely to Firebase Firestore. Your MoSJE counsellor has received your update.');
    setTimeout(() => setCounsellorRequestToast(null), 4500);
  };

  const handleRequestCounsellor = () => {
    setCounsellorRequestToast(
      'Counsellor Callback Requested. Dr. Ananya Sen will reach out during your preferred hours.'
    );
    setTimeout(() => setCounsellorRequestToast(null), 4500);
  };

  const handleOpenResourceFromHome = (resource: ResourceItem) => {
    setSelectedResource(resource);
    setCurrentTab('resources');
  };

  // If loading Firebase initial auth
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-sky-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center animate-bounce shadow-md">
            <Heart className="w-5 h-5 fill-white/20" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Connecting to Health Matrix Firebase...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show initial Login / Sign Up screen
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenHelpline={() => setIsHelplineOpen(true)}
        />
        <NHAAHelplineModal
          isOpen={isHelplineOpen}
          onClose={() => setIsHelplineOpen(false)}
        />
      </>
    );
  }

  // Counsellor Account -> CAN ONLY OPEN Counsellor / Admin Web View
  if (userRole === 'counsellor') {
    return (
      <div className="w-full min-h-screen bg-[#F8F9FA]">
        <CounsellorDashboard
          onLogout={handleLogout}
          onOpenHelpline={() => setIsHelplineOpen(true)}
        />
        <NHAAHelplineModal
          isOpen={isHelplineOpen}
          onClose={() => setIsHelplineOpen(false)}
        />
      </div>
    );
  }

  // Complainant (User) Account -> CAN ONLY OPEN Complainant View
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F3F8FC] via-white to-[#FAF8F5] text-slate-800 flex flex-col md:flex-row selection:bg-sky-100">
      {/* Toast Notification */}
      {counsellorRequestToast && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="leading-snug">{counsellorRequestToast}</p>
          </div>
          <button
            onClick={() => setCounsellorRequestToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop Sidebar (visible on md: and above) */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userProfile={userProfile}
        currentCase={currentCase}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        onRequestCounsellor={handleRequestCounsellor}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Application Bar (hidden on md:) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100/80 px-4 py-2.5 pt-safe">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-sky-200 shrink-0">
                <Heart className="w-5 h-5 fill-white/20 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-slate-800 tracking-tight">
                    Health Matrix
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>MoSJE • Samvedna</span>
                  <span className="text-emerald-600 font-semibold">• Cloud Synced</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick NHAA 14566 button */}
              <button
                onClick={() => setIsHelplineOpen(true)}
                aria-label="Call NHAA Helpline"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition active:scale-95 shadow-2xs min-h-[36px]"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                <span className="font-extrabold tracking-tight">14566</span>
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Top Header Bar (visible on md:) */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-sky-100 px-6 lg:px-8 py-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base lg:text-lg font-extrabold text-slate-800 tracking-tight">
              {currentTab === 'home' && 'Complainant Care Dashboard'}
              {currentTab === 'checkin' && 'Daily Check-In & Saathi AI Companion'}
              {currentTab === 'case' && 'SC/ST PoA Legal Case Tracking'}
              {currentTab === 'resources' && 'Legal Rights & Psychosocial Wellness Guides'}
              {currentTab === 'profile' && 'Confidentiality & Profile Preferences'}
            </h2>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">
              Case: {userProfile.caseId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHelplineOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>National Helpline 14566</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{userProfile.name}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area: mobile max-w-md, desktop max-w-5xl/6xl */}
        <main className="flex-1 w-full max-w-md md:max-w-5xl lg:max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pt-4 pb-28 md:pb-12 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeDashboard
              userName={userProfile.name}
              caseData={currentCase}
              currentMood={currentMood}
              onSelectMood={handleSelectMood}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenHelpline={() => setIsHelplineOpen(true)}
              onRequestCounsellor={handleRequestCounsellor}
              onOpenResource={handleOpenResourceFromHome}
            />
          )}

          {currentTab === 'checkin' && (
            <DailyCheckIn
              onSaveCheckIn={handleSaveCheckIn}
              onOpenHelpline={() => setIsHelplineOpen(true)}
              onRequestCounsellor={handleRequestCounsellor}
            />
          )}

          {currentTab === 'case' && (
            <CaseStatusView
              caseData={currentCase}
              onOpenHelpline={() => setIsHelplineOpen(true)}
              onRequestCounsellor={handleRequestCounsellor}
              onBack={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'resources' && (
            <ResourcesView
              onOpenHelpline={() => setIsHelplineOpen(true)}
              selectedResourceFromParent={selectedResource}
              onCloseResourceModal={() => setSelectedResource(null)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              onUpdateProfile={updateUserProfile}
              onLogout={handleLogout}
              onOpenHelpline={() => setIsHelplineOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation for Complainant App (Mobile Only) */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* NHAA 14566 National Helpline Modal */}
      <NHAAHelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <MainAppContent />
    </FirebaseProvider>
  );
}
