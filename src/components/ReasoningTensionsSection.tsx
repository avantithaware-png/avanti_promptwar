import React from 'react';
import { ReasoningTension } from '../types/decision';
import { Brain, Shuffle, Lightbulb } from 'lucide-react';

interface ReasoningTensionsSectionProps {
  tensions: ReasoningTension[];
}

export const ReasoningTensionsSection: React.FC<ReasoningTensionsSectionProps> = ({ tensions }) => {
  return (
    <section className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-code text-xs text-amber-400">03 / COGNITION</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h2 className="font-serif-display text-xl text-zinc-100">
              Reasoning Tensions & Cognitive Biases
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Internal contradictions where stated values clash with tangible choices.
          </p>
        </div>
        <span className="text-[11px] text-zinc-500 font-code self-start sm:self-auto">
          HEURISTIC AUDIT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {tensions.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-200">
                  {item.biasOrTension}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {item.diagnosis}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-emerald-400 text-[11px] mb-1">
                <Lightbulb className="w-3 h-3" />
                <span>Balancing Counter-Thought:</span>
              </div>
              <p className="text-zinc-300 italic text-[11px] leading-relaxed">
                "{item.correctiveThought}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
