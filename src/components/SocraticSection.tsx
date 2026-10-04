import React, { useState } from 'react';
import { SocraticInquiry, SocraticReflectionResult } from '../types/decision';
import { HelpCircle, MessageSquare, Send, Sparkles, AlertCircle, CornerDownRight, CheckCircle2 } from 'lucide-react';

interface SocraticSectionProps {
  inquiries: SocraticInquiry[];
  decisionTitle: string;
}

export const SocraticSection: React.FC<SocraticSectionProps> = ({
  inquiries,
  decisionTitle,
}) => {
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [userReflections, setUserReflections] = useState<Record<string, string>>({});
  const [reflectionResults, setReflectionResults] = useState<
    Record<string, SocraticReflectionResult>
  >({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleReflectSubmit = async (item: SocraticInquiry) => {
    const text = userReflections[item.id];
    if (!text || !text.trim()) return;

    setSubmittingId(item.id);
    setSubmitError(null);

    try {
      const res = await fetch('/api/socratic-reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          question: item.question,
          userReflection: text,
        }),
      });

      if (!res.ok) throw new Error('Failed to evaluate reflection.');
      const data: SocraticReflectionResult = await res.json();
      setReflectionResults((prev) => ({ ...prev, [item.id]: data }));
    } catch (err: any) {
      setSubmitError(err.message || 'Error processing reflection.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-code text-xs text-amber-400">05 / SOCRATIC INQUIRY</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h2 className="font-serif-display text-xl text-zinc-100">
              The Inquisitor's Circle
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Non-directive questions designed to stretch your perspective. Write your reflection to examine your reasoning in real time.
          </p>
        </div>
        <span className="text-[11px] text-zinc-500 font-code self-start sm:self-auto">
          INTERACTIVE PROBING
        </span>
      </div>

      <div className="space-y-4 pt-1">
        {inquiries.map((item, index) => {
          const isOpen = activeInquiryId === item.id;
          const result = reflectionResults[item.id];
          const isSubmitting = submittingId === item.id;

          return (
            <div
              key={item.id || index}
              className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] text-amber-400 font-code">
                    INQUIRY #{index + 1}
                  </div>
                  <h3 className="font-serif-display text-base text-zinc-100 leading-snug">
                    "{item.question}"
                  </h3>
                  <p className="text-xs text-zinc-400">
                    <span className="text-zinc-500">Underlying focal point: </span>
                    {item.intent}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInquiryId(isOpen ? null : item.id)}
                  className="shrink-0 text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isOpen ? 'Close Reflection' : 'Reflect on This'}</span>
                </button>
              </div>

              {/* Reflection Drawer */}
              {isOpen && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Your Candid Reflection:
                    </label>
                    <textarea
                      rows={3}
                      value={userReflections[item.id] || ''}
                      onChange={(e) =>
                        setUserReflections((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Write your honest response to this question. Don't worry about sounding polished..."
                      className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 italic">
                      Aperture will analyze whether your response resolves or sidesteps the tension.
                    </span>

                    <button
                      type="button"
                      disabled={isSubmitting || !userReflections[item.id]?.trim()}
                      onClick={() => handleReflectSubmit(item)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Reflection</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>

                  {submitError && (
                    <div className="p-2.5 rounded bg-red-950/30 border border-red-800 text-[11px] text-red-300">
                      {submitError}
                    </div>
                  )}

                  {/* Feedback Result */}
                  {result && (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-700/80 space-y-2.5 animate-fade-in text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-code text-amber-400">
                          REFLECTION EVALUATION: {result.reflectionDepth.toUpperCase()}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Examined
                        </span>
                      </div>

                      <p className="text-zinc-300 leading-relaxed">
                        {result.assessment}
                      </p>

                      <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300">
                        <strong className="text-amber-300 block text-[11px] mb-0.5">
                          Newly Surfaced Belief / Priority:
                        </strong>
                        {result.newlySurfacedBelief}
                      </div>

                      <div className="pt-1 text-amber-200/90 italic flex items-start gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Next Thought: </strong>
                          "{result.followUpInquiry}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
