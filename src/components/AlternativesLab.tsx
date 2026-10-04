import React, { useState } from 'react';
import { AlternativeOption, ContextDetails } from '../types/decision';
import { GitFork, MessageSquareQuote, CheckCircle2, Play, Sparkles, Copy, Check } from 'lucide-react';

interface AlternativesLabProps {
  decisionTitle: string;
  primaryReasons: string;
  contextDetails: ContextDetails;
}

export const AlternativesLab: React.FC<AlternativesLabProps> = ({
  decisionTitle,
  primaryReasons,
  contextDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<AlternativeOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const fetchAlternatives = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          primaryReasons,
          contextDetails,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate alternatives.');
      const data = await res.json();
      setAlternatives(data.alternatives);
    } catch (err: any) {
      setError(err.message || 'Error generating alternatives.');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = (script: string, idx: number) => {
    navigator.clipboard.writeText(script);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-code text-cyan-400">
              <GitFork className="w-3.5 h-3.5" />
              <span>BREAKING THE FALSE BINARY</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100">
              The "Third Way" Architecture
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              We frequently trap ourselves in an artificial either/or: <em className="text-zinc-200">"Accept 40 hours and risk burnout, or decline and lose everything."</em> Most decisions offer hybrid levers: scope changes, timing deferrals, and phased milestones.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAlternatives}
            disabled={loading}
            className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                <span>Designing Hybrid Paths...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{alternatives ? 'Regenerate Paths' : 'Explore Hybrid Alternatives'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-800 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Alternatives Cards */}
      {alternatives && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-code text-cyan-400">ALTERNATIVE #{idx + 1}</span>
                </div>
                <h3 className="font-serif-display text-lg text-zinc-100 font-medium">
                  {alt.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {alt.mechanism}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/80">
                    <span className="text-emerald-400 font-medium block mb-0.5">
                      Upside Preserved:
                    </span>
                    <span className="text-zinc-300 leading-snug block">
                      {alt.benefitRetained}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800/80">
                    <span className="text-amber-400 font-medium block mb-0.5">
                      Blind Spot Mitigated:
                    </span>
                    <span className="text-zinc-300 leading-snug block">
                      {alt.blindSpotMitigated}
                    </span>
                  </div>
                </div>

                {/* Negotiation Script */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 relative group">
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-zinc-400 flex items-center gap-1 font-medium">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Negotiation Script / Conversation Starter:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copyScript(alt.negotiationScript, idx)}
                      className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
                      title="Copy script"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-200 italic font-serif-display text-xs leading-relaxed">
                    "{alt.negotiationScript}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
