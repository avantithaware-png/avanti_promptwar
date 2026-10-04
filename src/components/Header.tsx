import React, { useState } from 'react';
import { Compass, ShieldAlert, Sparkles, BookOpen, ChevronRight, X, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onNewDecision: () => void;
  hasActiveAnalysis: boolean;
  onOpenAudit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  hasActiveAnalysis,
  onOpenAudit,
}) => {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-800/80 bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-display text-xl tracking-tight text-zinc-100 font-medium">
                  Aperture
                </span>
                <span className="text-xs text-zinc-500 font-code tracking-wider">
                  / BLIND SPOT STUDIO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Cognitive mirror for complex decisions · Exposing what visible data conceals
              </p>
            </div>
          </div>

          {/* Actions & Non-Decider Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowManifesto(true)}
              className="text-xs text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1.5 px-2.5 rounded-md hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800"
              title="Read our Non-Decider Principle"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80" />
              <span className="hidden md:inline">The Non-Decider Principle</span>
              <span className="md:hidden">Ethics</span>
            </button>

            {hasActiveAnalysis && (
              <button
                onClick={onNewDecision}
                className="text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-700/80 transition-all flex items-center gap-1.5"
              >
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Non-Decider Manifesto Modal */}
      {showManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12151c] border border-zinc-700/90 rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowManifesto(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-serif-display text-xl text-zinc-100">
                The Non-Decider Principle
              </h3>
            </div>

            <div className="space-y-3.5 text-sm text-zinc-300 leading-relaxed">
              <p>
                Human psychology naturally fixates on the most visible, immediate, and tangible
                data: an hourly pay rate, an easy commute, a prestigious brand name, or an urgent
                deadline.
              </p>
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                <span className="font-medium text-amber-300 block">Our Core Mandate:</span>
                Aperture will <strong className="text-white underline underline-offset-2">never</strong> tell you to say "Yes" or "No", and will never rate one choice as objectively superior.
              </div>
              <p>
                Instead, Aperture acts as an intellectual mirror. It questions the assumptions
                you took for granted, calculates the quiet opportunity costs that haven't arrived yet,
                and probes the internal contradictions in your stated reasoning.
              </p>
              <p className="text-zinc-400 text-xs pt-1">
                The final choice, moral agency, and ownership belong solely to you.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowManifesto(false)}
                className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
