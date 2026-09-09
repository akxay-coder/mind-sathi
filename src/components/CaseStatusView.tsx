import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  Shield,
  FileText,
  DollarSign,
  User,
  Scale,
  Calendar,
  AlertCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { CaseData, CaseStage } from '../types';

interface CaseStatusViewProps {
  caseData: CaseData;
  onOpenHelpline: () => void;
  onRequestCounsellor: () => void;
}

export const CaseStatusView: React.FC<CaseStatusViewProps> = ({
  caseData,
  onOpenHelpline,
  onRequestCounsellor,
}) => {
  const stages: { id: CaseStage; label: string; stepNum: number }[] = [
    { id: 'registration', label: 'Registration', stepNum: 1 },
    { id: 'investigation', label: 'Investigation', stepNum: 2 },
    { id: 'trial', label: 'Trial', stepNum: 3 },
    { id: 'rehabilitation', label: 'Rehabilitation', stepNum: 4 },
    { id: 'compensation', label: 'Compensation', stepNum: 5 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === caseData.currentStage);

  return (
    <div className="w-full pb-24 space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-sky-50/40 to-slate-50 rounded-3xl p-5 border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Special Designated Court Matter
          </span>
          <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
            Active
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Case Status & Journey
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Case Ref: <strong className="text-slate-700">{caseData.caseNumber}</strong>
        </p>
      </div>

      {/* Horizontal Stage Stepper Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm overflow-x-auto">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Journey Progression
        </h2>

        {/* Desktop / Tablet & Mobile Stepper */}
        <div className="flex items-center justify-between min-w-[320px] relative px-2">
          {/* Background connector line */}
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-100 -z-0" />
          <div
            className="absolute left-6 top-4 h-1 bg-sky-500 -z-0 transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (stages.length - 1)) * 90}%`,
            }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isUpcoming = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-md scale-110'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{stage.stepNum}</span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-2 font-bold max-w-[62px] leading-tight ${
                    isCurrent
                      ? 'text-sky-900 font-extrabold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>

                {isCurrent && (
                  <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-md mt-1">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Vertical Milestone Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          Milestone Timeline
        </h3>

        <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-8">
          {caseData.timeline.map((step) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div key={step.stage} className="relative space-y-1">
                {/* Node icon */}
                <div
                  className={`absolute -left-[30px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                      : 'bg-slate-200 text-slate-400 ring-2 ring-white'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  ) : (
                    <Circle className="w-2 h-2" />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-sky-900'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.date && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {step.date}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                {step.officerNote && (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-500 mt-1">
                    <strong className="text-slate-700">Official Note:</strong>{' '}
                    {step.officerNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compensation & Relief Status Card */}
      <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl p-5 border border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                MoSJE Victim Relief Fund
              </h3>
              <p className="text-[10px] text-slate-500">
                Direct Benefit Transfer (DBT)
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            Under PoA Scheme
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-white border border-emerald-100">
            <p className="text-[10px] text-slate-400 font-medium">
              Interim Disbursed
            </p>
            <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
              {caseData.compensationStatus.interimDisbursed}
            </p>
            <p className="text-[9px] text-emerald-600 mt-0.5">
              Credited to Bank Account
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium">
              Total Sanctioned
            </p>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">
              {caseData.compensationStatus.totalEligible}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              Balance post-trial verdict
            </p>
          </div>
        </div>
      </div>

      {/* Legal Aid & Protected Contact */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-sky-600" />
          <span>Assigned Legal Support Contacts</span>
        </h3>

        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Legal Aid Advocate
              </p>
              <p className="text-[11px] text-slate-500">
                {caseData.districtLegalAid}
              </p>
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
              Free Legal Aid
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Investigation Officer
              </p>
              <p className="text-[11px] text-slate-500">
                {caseData.assignedOfficer}
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-200/60 px-2 py-1 rounded-lg">
              Special Cell
            </span>
          </div>
        </div>

        <button
          onClick={onRequestCounsellor}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <span>Need help understanding court paperwork? Talk to Counsellor</span>
        </button>
      </div>
    </div>
  );
};
