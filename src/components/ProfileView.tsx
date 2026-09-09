import React, { useState } from 'react';
import {
  User,
  Shield,
  Phone,
  MessageSquare,
  Lock,
  Globe,
  Bell,
  LogOut,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Smartphone,
  EyeOff,
  Cloud,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onOpenHelpline: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onLogout,
  onOpenHelpline,
}) => {
  const { currentUser, isFirebaseConnected } = useFirebase();
  const [preference, setPreference] = useState(userProfile.contactPreference);
  const [preferredTime, setPreferredTime] = useState(userProfile.preferredTime);
  const [language, setLanguage] = useState(userProfile.language);
  const [biometric, setBiometric] = useState(userProfile.biometricEnabled);
  const [confidentialMode, setConfidentialMode] = useState(userProfile.confidentialMode);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSavePreferences = () => {
    onUpdateProfile({
      contactPreference: preference,
      preferredTime,
      language,
      biometricEnabled: biometric,
      confidentialMode,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
  ];

  return (
    <div className="w-full pb-24 space-y-4 animate-in fade-in duration-300">
      {/* Toast */}
      {showSavedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated securely</span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-sky-50 via-sky-50/40 to-slate-50 rounded-3xl p-5 border border-sky-100 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-200">
            {userProfile.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-800 truncate">
                {userProfile.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Complainant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Age: {userProfile.age} • Registered with Special Cell
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Case ID: {userProfile.caseId}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onOpenHelpline}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold transition shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 14566</span>
          </button>
        </div>
      </div>

      {/* Responsive 2-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Contact Preferences & Language */}
        <div className="space-y-5">
          {/* Contact Preferences */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Contact Preferences for Counsellor</span>
              </h2>
              <span className="text-[10px] text-slate-400">For outreach only</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              How do you prefer your assigned MoSJE counsellor or DLSA team to reach out to you?
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'call', label: 'Voice Call', desc: 'Direct phone conversation' },
                { id: 'whatsapp', label: 'WhatsApp Message', desc: 'Discreet encrypted text' },
                { id: 'sms', label: 'Standard SMS', desc: 'Brief text notice' },
                { id: 'silent', label: 'Silent Mode', desc: 'In-app notification only' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreference(item.id as any)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    preference === item.id
                      ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Preferred Call Hours:
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="10:00 AM - 1:00 PM">Morning (10:00 AM – 1:00 PM)</option>
                <option value="1:00 PM - 4:00 PM">Afternoon (1:00 PM – 4:00 PM)</option>
                <option value="4:00 PM - 7:00 PM">Evening (4:00 PM – 7:00 PM)</option>
                <option value="Anytime in Emergency">Anytime in Emergency</option>
              </select>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Preferred Language
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              The app interface, counsellor notes, and NHAA support adapt to your selected language.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                    language === l.code
                      ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Privacy, Actions, Sync */}
        <div className="space-y-5">
          {/* Privacy & Consent */}
          <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Privacy & Consent Protocol
              </h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="pr-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Biometric & Quick PIN Lock
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Requires fingerprint / PIN whenever reopening Health Matrix
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={biometric}
                  onChange={(e) => setBiometric(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-400 accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="pr-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Discreet Notification Masking
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Hides case details from phone lock-screen preview
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={confidentialMode}
                  onChange={(e) => setConfidentialMode(e.target.checked)}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-400 accent-sky-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firebase Cloud Storage & Auth</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-semibold text-[10px]">
                  {currentUser ? 'Authenticated' : 'Cloud Sync Active'}
                </span>
              </div>
              <p className="text-slate-600">
                {currentUser
                  ? `Signed in as ${currentUser.email || currentUser.displayName || currentUser.uid}. Data safely synced across PC and mobile.`
                  : 'Your check-ins and profile preferences are persisted securely using Firebase Firestore.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-sky-900">
                MoSJE Victim Privacy Guarantee:
              </p>
              <p>
                Your check-in responses, distress scores, and conversational reflections are protected under statutory privilege. They cannot be requisitioned without judicial order.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleSavePreferences}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-md shadow-sky-200 text-xs transition active:scale-95"
            >
              Save Profile Settings
            </button>

            <button
              onClick={onLogout}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Health Matrix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
