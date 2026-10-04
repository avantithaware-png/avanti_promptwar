import React from 'react';
import { OverlookedConsequence } from '../types/decision';
import { Clock, TrendingDown, GitFork } from 'lucide-react';

interface ConsequencesSectionProps {
  consequences: OverlookedConsequence[];
}

export const ConsequencesSection: React.FC<ConsequencesSectionProps> = ({ consequences }) => {
  return (
    <section className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-code text-xs text-amber-400">02 / TIME HORIZONS</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h2 className="font-serif-display text-xl text-zinc-100">
              Overlooked 2nd & 3rd-Order Consequences
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ripple effects and silent opportunity costs that appear only after the initial novelty fades.
          </p>
        </div>
        <span className="text-[11px] text-zinc-500 font-code self-start sm:self-auto">
          SYSTEMIC RIPPLES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {consequences.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-200">{item.title}</span>
                <span className="font-code text-[11px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {item.timeHorizon}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {item.explanation}
              </p>
            </div>

            <div className="pt-2.5 border-t border-zinc-800/70 text-xs text-amber-300/90 bg-amber-950/20 -mx-4 -mb-4 p-3 rounded-b-lg border-t-0">
              <div className="flex items-center gap-1.5 font-medium text-amber-400 text-[11px] mb-0.5">
                <GitFork className="w-3 h-3" />
                <span>Foreclosed Opportunity Cost:</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal">
                {item.opportunityCost}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
