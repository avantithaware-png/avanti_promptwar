import React from 'react';
import { CriticalMissingInfo } from '../types/decision';
import { CheckSquare, Square, Search, HelpCircle, CheckCircle2 } from 'lucide-react';

interface MissingInfoSectionProps {
  missingInfo: CriticalMissingInfo[];
  investigatedIndices: number[];
  onToggleInvestigated: (index: number) => void;
}

export const MissingInfoSection: React.FC<MissingInfoSectionProps> = ({
  missingInfo,
  investigatedIndices,
  onToggleInvestigated,
}) => {
  const verifiedCount = investigatedIndices.length;

  return (
    <section className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-code text-xs text-amber-400">04 / DISCOVERY</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h2 className="font-serif-display text-xl text-zinc-100">
              Critical Missing Information (Due Diligence Gaps)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Key empirical facts you do not currently possess that could drastically swing your choice.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-code self-start sm:self-auto text-zinc-400">
          <span>{verifiedCount} of {missingInfo.length} Investigated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-1">
        {missingInfo.map((item, index) => {
          const isDone = investigatedIndices.includes(index);
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                isDone
                  ? 'bg-emerald-950/15 border-emerald-500/30'
                  : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleInvestigated(index)}
                  className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                  title={isDone ? 'Mark as pending' : 'Mark as investigated'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-600" />
                  )}
                </button>

                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDone ? 'text-emerald-200 line-through' : 'text-zinc-100'}`}>
                      {item.unknownFact}
                    </span>
                    {isDone && (
                      <span className="text-[11px] text-emerald-400 font-code">VERIFIED</span>
                    )}
                  </div>

                  <p className="text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-400 font-medium">Why it matters: </strong>
                    {item.whyItMatters}
                  </p>

                  <div className="pt-1.5 flex items-start gap-1.5 text-zinc-400">
                    <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-400/90 font-medium">How to verify: </strong>
                      {item.howToFindOut}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
