import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Shield,
  Heart,
  Scale,
  PhoneCall,
  AlertCircle,
  Clock,
  ArrowRight,
  Phone,
  Bookmark,
  Share2,
  CheckCircle,
  X,
} from 'lucide-react';
import { ResourceCategory, ResourceItem } from '../types';
import { RESOURCES_DATA } from '../data/mockData';

interface ResourcesViewProps {
  onOpenHelpline: () => void;
  onSelectResource?: (res: ResourceItem) => void;
  selectedResourceFromParent?: ResourceItem | null;
  onCloseResourceModal?: () => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  onOpenHelpline,
  onSelectResource,
  selectedResourceFromParent,
  onCloseResourceModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalResource, setActiveModalResource] = useState<ResourceItem | null>(
    selectedResourceFromParent || null
  );

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'emotional', label: 'Emotional Support' },
    { id: 'self_care', label: 'Self-Care' },
    { id: 'legal', label: 'Legal/Case Info' },
    { id: 'helpline', label: 'Helpline Support' },
    { id: 'crisis', label: 'Crisis/Emergency' },
  ] as const;

  const filtered = RESOURCES_DATA.filter((res) => {
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'emotional':
        return Heart;
      case 'self_care':
        return Shield;
      case 'legal':
        return Scale;
      case 'helpline':
        return PhoneCall;
      case 'crisis':
        return AlertCircle;
      default:
        return BookOpen;
    }
  };

  const openResource = (res: ResourceItem) => {
    setActiveModalResource(res);
    if (onSelectResource) onSelectResource(res);
  };

  const closeResource = () => {
    setActiveModalResource(null);
    if (onCloseResourceModal) onCloseResourceModal();
  };

  return (
    <div className="w-full pb-24 space-y-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50/40 rounded-3xl p-5 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
            Knowledge & Healing
          </span>
          <button
            onClick={onOpenHelpline}
            className="flex items-center gap-1 text-[11px] font-bold text-sky-700 px-2.5 py-1 rounded-full bg-white border border-sky-200 shadow-xs"
          >
            <Phone className="w-3 h-3 text-sky-600" />
            <span>NHAA 14566</span>
          </button>
        </div>

        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Support & Guidance Library
        </h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Calm, non-clinical explanations of your emotional wellbeing, survivor rights, and verified 24x7 crisis lines.
        </p>

        {/* Search Input */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics: anxiety, court rights, sleep, 14566..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-sky-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-xs transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Resource Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-100">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No resources found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try searching with another keyword or pick 'All Resources'.
            </p>
          </div>
        ) : (
          filtered.map((res) => {
            const Icon = getCategoryIcon(res.category);
            const isCrisis = res.category === 'crisis';

            return (
              <div
                key={res.id}
                onClick={() => openResource(res)}
                className={`p-4 rounded-3xl border transition cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isCrisis
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : 'bg-white border-sky-100/90 hover:border-sky-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isCrisis
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCrisis
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {res.categoryLabel}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {res.readTime}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-900 transition mt-2.5 leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {res.summary}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-sky-700 group-hover:text-sky-900">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resource Detail Reader Modal */}
      {activeModalResource && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-xl md:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-sky-50/50 to-slate-50 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {activeModalResource.categoryLabel}
                </span>
                <h3 className="text-base font-extrabold text-slate-800 leading-snug">
                  {activeModalResource.title}
                </h3>
              </div>

              <button
                onClick={closeResource}
                aria-label="Close modal"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 leading-relaxed">
                {activeModalResource.summary}
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
                {activeModalResource.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100/80"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Key Helpline Contacts if available */}
              {activeModalResource.keyContacts && (
                <div className="mt-4 pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Direct Official Dialers:
                  </h4>
                  <div className="space-y-1.5">
                    {activeModalResource.keyContacts.map((contact) => (
                      <a
                        key={contact.name}
                        href={`tel:${contact.number}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-sky-950">
                            {contact.name}
                          </p>
                          <p className="text-[10px] text-sky-700">
                            {contact.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-xs">
                          <Phone className="w-3 h-3" />
                          <span>{contact.number}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                MoSJE Samvedna Welfare Library
              </span>
              <button
                onClick={closeResource}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
