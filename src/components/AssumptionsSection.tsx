import React, { useState } from 'react';
import { HiddenAssumption } from '../types/decision';
import { StressTestModal } from './StressTestModal';
import { Layers, AlertCircle, ArrowUpRight } from 'lucide-react';

interface AssumptionsSectionProps {
  assumptions: HiddenAssumption[];
  decisionTitle: string;
}

export const AssumptionsSection: React.FC<AssumptionsSectionProps> = ({
  assumptions,
  decisionTitle,
}) => {
  const [activeTestAssumption, setActiveTestAssumption] = useState<HiddenAssumption | null>(null);

  return (
    <section className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-code text-xs text-amber-400">01 / FOUNDATIONS</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h2 className="font-serif-display text-xl text-zinc-100">
              Unstated & Fragile Assumptions
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Implicit premises you are relying on without empirical confirmation.
          </p>
        </div>
        <span className="text-[11px] text-zinc-500 font-code self-start sm:self-auto">
          {assumptions.length} IMPLICIT PREMISES DETECTED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 pt-1">
        {assumptions.map((item, index) => (
          <div
            key={item.id || index}
            className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-zinc-400 font-medium">
                  Assumption #{index + 1}
                </span>
                <span className={`text-[11px] font-code ${
                  item.fragilityLevel.toLowerCase().includes('high')
                    ? 'text-rose-400'
                    : item.fragilityLevel.toLowerCase().includes('med')
                    ? 'text-amber-400'
                    : 'text-zinc-400'
                }`}>
                  {item.fragilityLevel} Fragility
                </span>
              </div>

              <div className="text-sm font-medium text-zinc-100 leading-snug">
                "{item.assumption}"
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed pl-3 border-l-2 border-amber-500/40">
                <span className="text-amber-400 font-medium">Why it is vulnerable: </span>
                {item.vulnerability}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-zinc-400 italic">
                <span className="not-italic text-zinc-500 font-code mr-1.5">TEST:</span>
                "{item.stressTestQuestion}"
              </div>
              <button
                type="button"
                onClick={() => setActiveTestAssumption(item)}
                className="shrink-0 self-start sm:self-auto text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Stress-Test</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeTestAssumption && (
        <StressTestModal
          decisionTitle={decisionTitle}
          assumption={activeTestAssumption}
          onClose={() => setActiveTestAssumption(null)}
        />
      )}
    </section>
  );
};
