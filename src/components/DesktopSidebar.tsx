import React from 'react';
import {
  Home,
  MessageCircleHeart,
  Scale,
  BookOpen,
  User,
  Phone,
  Shield,
  Heart,
  LogOut,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { TabType, UserProfile, CaseData } from '../types';

interface DesktopSidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userProfile: UserProfile;
  currentCase: CaseData;
  onOpenHelpline: () => void;
  onRequestCounsellor: () => void;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  currentCase,
  onOpenHelpline,
  onRequestCounsellor,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'home' as TabType,
      label: 'Home Dashboard',
      subtitle: 'Daily reflection & status',
      icon: Home,
    },
    {
      id: 'checkin' as TabType,
      label: 'Daily Check-In & AI',
      subtitle: 'Somatic calming & Saathi',
      icon: MessageCircleHeart,
    },
    {
      id: 'case' as TabType,
      label: 'Legal Case Status',
      subtitle: 'FIR, hearings & DLSA',
      icon: Scale,
    },
    {
      id: 'resources' as TabType,
      label: 'Legal & Wellness Guides',
      subtitle: 'Rights & psychoeducation',
      icon: BookOpen,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile & Security',
      subtitle: 'Confidentiality & preferences',
      icon: User,
    },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between bg-white border-r border-sky-100/90 h-screen sticky top-0 z-20 shrink-0 select-none shadow-xs">
      {/* Top Brand Section */}
      <div className="p-5 border-b border-sky-100/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
            <Heart className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Health Matrix
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Active" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              MoSJE • Samvedna Portal
            </p>
          </div>
        </div>

        <div className="mt-3.5 px-2.5 py-1.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-sky-800 flex items-center gap-1">
            <Shield className="w-3 h-3 text-sky-600" />
            <span>SC/ST PoA Protected</span>
          </span>
          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
            Encrypted
          </span>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200/80 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs tracking-tight truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}

        {/* Quick Crisis & Support Widget */}
        <div className="pt-3 px-1 space-y-2">
          {/* NHAA 14566 Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-md shadow-sky-200/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-200">
                National Helpline
              </span>
              <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.2 rounded-full">
                24x7 Free
              </span>
            </div>
            <div>
              <div className="text-sm font-extrabold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
                <span>NHAA 14566</span>
              </div>
              <p className="text-[10px] text-sky-100 leading-snug mt-0.5">
                Instant crisis relief & police liaison under MoSJE
              </p>
            </div>
            <button
              onClick={onOpenHelpline}
              className="w-full py-1.5 px-2.5 rounded-xl bg-white text-sky-800 hover:bg-sky-50 text-[11px] font-extrabold transition shadow-2xs flex items-center justify-center gap-1"
            >
              <span>Connect Immediately</span>
            </button>
          </div>

          {/* Assigned Counsellor Mini Card */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate">
                  {currentCase.assignedCounsellor}
                </p>
                <p className="text-[9px] text-slate-500">Dedicated MoSJE Counsellor</p>
              </div>
            </div>
            <button
              onClick={onRequestCounsellor}
              className="w-full py-1 px-2 rounded-lg bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 hover:border-sky-200 text-[10px] font-bold transition flex items-center justify-center gap-1"
            >
              <span>Request Callback</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Profile & Logout Bottom Footer */}
      <div className="p-3.5 border-t border-sky-100/80 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {userProfile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{userProfile.caseId}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
