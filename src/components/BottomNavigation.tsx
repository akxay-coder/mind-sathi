import React from 'react';
import { Home, MessageCircleHeart, BookOpen, User } from 'lucide-react';

export type TabType = 'home' | 'checkin' | 'resources' | 'profile' | 'case';

interface BottomNavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'checkin', label: 'Check-In', icon: MessageCircleHeart },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-[58px] min-h-[48px] ${
                isActive
                  ? 'text-sky-700 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-sky-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
