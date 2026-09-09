import React, { useState } from 'react';
import { Phone, Shield, HeartHandshake, Clock, X, CheckCircle, ExternalLink, Lock } from 'lucide-react';

interface NHAAHelplineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NHAAHelplineModal: React.FC<NHAAHelplineModalProps> = ({ isOpen, onClose }) => {
  const [callInitiated, setCallInitiated] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header with soft gradient */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-5 border-b border-sky-100 relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-200">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  MoSJE Helpline
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  24x7 Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                NHAA 14566
              </h3>
              <p className="text-xs text-slate-500">
                National Helpline Against Atrocities
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {callInitiated ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-900 text-base">
                Connecting to 14566 Helpline
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                If on a mobile device, your phone dialer has been prepared with toll-free <strong>14566</strong>. Our trained counsellors are ready to support you with confidentiality.
              </p>
              <a
                href="tel:14566"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-200 transition"
              >
                <Phone className="w-4 h-4" /> Dial 14566 Directly
              </a>
            </div>
          ) : (
            <>
              {/* Toll-free highlight banner */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-sky-200/50 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider font-semibold text-sky-100 block mb-1">
                    Free Toll-Free Number
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight text-white mb-2">
                    14566
                  </div>
                  <p className="text-xs text-sky-100 leading-relaxed max-w-xs mx-auto mb-4">
                    Immediate psychological first aid, legal aid coordination, and grievance escalation.
                  </p>
                  <a
                    href="tel:14566"
                    onClick={() => setCallInitiated(true)}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white hover:bg-sky-50 text-sky-700 font-bold rounded-xl text-sm shadow-md transition transform active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-sky-600" /> Tap to Call 14566 (Toll-Free)
                  </a>
                </div>
              </div>

              {/* Assurances */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Lock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">100% Confidential:</strong> Your identity and statements are protected under strict MoSJE privacy guidelines.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Multilingual:</strong> Available in Hindi, English, and regional Indian languages.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Available 24x7:</strong> Day or night, trained support officers and counsellors are on duty.
                  </p>
                </div>
              </div>

              {/* Other emergency lines */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Other Official Helplines:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:14416"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 text-xs font-medium text-slate-700 transition"
                  >
                    <span>Tele-MANAS</span>
                    <span className="font-bold text-sky-700">14416</span>
                  </a>
                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-xs font-medium text-slate-700 transition"
                  >
                    <span>Police / SOS</span>
                    <span className="font-bold text-rose-700">112</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            Ministry of Social Justice and Empowerment • Govt. of India
          </p>
        </div>
      </div>
    </div>
  );
};
