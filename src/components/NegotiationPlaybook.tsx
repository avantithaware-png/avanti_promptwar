import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Handshake,
  Mail,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { ContextDetails } from '../types/decision';

interface NegotiationStrategy {
  title: string;
  goal: string;
  emailScript: string;
  verbalPitch: string;
  anticipatedPushback: string;
  counterResponse: string;
  feasibilityScore: string;
}

interface NegotiationPlaybookProps {
  decisionTitle: string;
  primaryReasons: string;
  contextDetails: ContextDetails;
  onAttachToNotes?: (text: string) => void;
}

export const NegotiationPlaybook: React.FC<NegotiationPlaybookProps> = ({
  decisionTitle,
  primaryReasons,
  contextDetails,
  onAttachToNotes,
}) => {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<NegotiationStrategy[] | null>(null);
  const [mindsetTip, setMindsetTip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchPlaybook = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/negotiation-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          primaryReasons,
          contextDetails,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate negotiation strategies.');
      }

      const data = await res.json();
      setStrategies(data.strategies);
      setMindsetTip(data.negotiatorMindsetTip);
    } catch (err: any) {
      setError(err.message || 'Error generating negotiation playbook.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-code text-emerald-400">
              <Handshake className="w-3.5 h-3.5" />
              <span>THE THIRD WAY · LEVERAGE & COUNTER-OFFER SCRIPTS</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100">
              Negotiation & Compromise Playbook
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deciders often falsely assume an offer is a binary "take-it-or-leave-it" ultimatum. High-leverage compromises (like capped 32-hour work weeks, remote course days, or deferred starts) eliminate downside without sacrificing the opportunity.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPlaybook}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Crafting Counter-Proposals...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{strategies ? 'Regenerate Proposals' : 'Generate Negotiation Playbook'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Strategies List */}
      {strategies && (
        <div className="space-y-5 animate-fade-in">
          {mindsetTip && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-emerald-300 font-medium">Negotiator's Golden Rule: </strong>
                {mindsetTip}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            {strategies.map((strat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 sm:p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 space-y-4 hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-code text-[11px] text-emerald-400 font-bold uppercase">
                      STRATEGY 0{idx + 1}
                    </span>
                    <h3 className="font-serif-display text-lg text-zinc-100 font-medium">
                      {strat.title}
                    </h3>
                  </div>
                  <span className="self-start sm:self-auto font-code text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-semibold">
                    {strat.feasibilityScore}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 space-y-1">
                  <strong className="text-zinc-200">Objective / Blind Spot Neutralized: </strong>
                  <span>{strat.goal}</span>
                </div>

                {/* Email Script Box */}
                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 relative group">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 font-code text-emerald-400">
                      <Mail className="w-3.5 h-3.5" />
                      <span>RECOMMENDED EMAIL COUNTER-PROPOSAL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(strat.emailScript, `email-${idx}`)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] flex items-center gap-1 border border-zinc-800 cursor-pointer"
                    >
                      {copiedKey === `email-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-200 whitespace-pre-wrap font-sans-body leading-relaxed bg-zinc-900/50 p-3 rounded border border-zinc-800/80">
                    {strat.emailScript}
                  </div>
                </div>

                {/* Verbal Pitch & Pushback Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-medium text-[11px]">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Verbal Pitch (1-to-1 Conversation)</span>
                    </div>
                    <p className="text-zinc-300 italic font-serif-display leading-relaxed">
                      "{strat.verbalPitch}"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-300 font-medium text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Anticipated Pushback & Counter-Pivot</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-tight">
                      <strong>They might say: </strong>"{strat.anticipatedPushback}"
                    </p>
                    <p className="text-emerald-300 text-[11px] leading-tight">
                      <strong>You reply: </strong>"{strat.counterResponse}"
                    </p>
                  </div>
                </div>

                {onAttachToNotes && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onAttachToNotes(
                          `• Negotiation Strategy (${strat.title}): ${strat.goal} (Feasibility: ${strat.feasibilityScore})`
                        )
                      }
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Attach Strategy to Decision Notes</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
