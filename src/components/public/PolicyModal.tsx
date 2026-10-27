import React from 'react';
import { PolicyItem } from '../../types';
import { X, ScrollText, Calendar, Printer, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  policy: PolicyItem | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {policy.title}
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Official Policy
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Effective Date: {policy.effectiveDate || 'Immediate'}
                </span>
                {policy.lastUpdated && (
                  <>
                    <span>•</span>
                    <span>Updated: {policy.lastUpdated}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950/40">
          {policy.summary && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Summary Overview:</strong> {policy.summary}
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed font-sans">
            {policy.content.split('\n\n').map((block, i) => {
              if (block.startsWith('## ')) {
                return (
                  <h3 key={i} className="text-base sm:text-lg font-bold text-white pt-3 pb-1 border-b border-slate-800/80">
                    {block.replace('## ', '')}
                  </h3>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h4 key={i} className="text-sm sm:text-base font-semibold text-indigo-300 pt-2">
                    {block.replace('### ', '')}
                  </h4>
                );
              }
              if (block.startsWith('---')) {
                return <hr key={i} className="border-slate-800 my-4" />;
              }
              if (block.startsWith('- ')) {
                const items = block.split('\n').map(l => l.replace(/^- /, ''));
                return (
                  <ul key={i} className="list-disc pl-5 space-y-1 text-slate-300">
                    {items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="whitespace-pre-line text-slate-300">{block}</p>;
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900 text-xs text-slate-500">
          <span>Shifa Productions Compliance Document</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
