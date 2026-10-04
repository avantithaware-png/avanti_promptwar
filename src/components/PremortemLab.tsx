import React, { useState } from 'react';
import { PremortemResult, FailureCascade, ContextDetails } from '../types/decision';
import { Skull, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';

interface PremortemLabProps {
  decisionTitle: string;
  primaryReasons: string;
  contextDetails: ContextDetails;
}

export const PremortemLab: React.FC<PremortemLabProps> = ({
  decisionTitle,
  primaryReasons,
  contextDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PremortemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simulate-premortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          primaryReasons,
          contextDetails,
        }),
      });

      if (!res.ok) throw new Error('Failed to run pre-mortem simulation.');
      const data: PremortemResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error running pre-mortem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-code text-rose-400">
              <Skull className="w-3.5 h-3.5" />
              <span>PROSPECTIVE HINDSIGHT METHODOLOGY</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100">
              The Pre-Mortem Simulator
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Psychological research shows that assuming a decision has <em className="text-zinc-200">already failed in the future</em> allows the human mind to bypass optimism bias and spot failure cascades before making a commitment.
            </p>
          </div>

          <button
            type="button"
            onClick={runSimulation}
            disabled={loading}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                <span>Simulating Cascades...</span>
              </>
            ) : result ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-simulate Pre-Mortem</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Failure Simulation</span>
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

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.failureCascades.map((cascade, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="text-[11px] font-code text-rose-400">
                    FAILURE CASCADE 0{idx + 1}
                  </div>
                  <h3 className="font-serif-display text-lg text-zinc-100">
                    {cascade.scenarioName}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {cascade.narrative}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-800 text-xs">
                  <div className="text-zinc-400">
                    <span className="text-rose-400 font-medium">Root Blind Spot: </span>
                    {cascade.rootBlindSpot}
                  </div>

                  <div className="text-zinc-400">
                    <span className="text-amber-400 font-medium">The Tipping Point: </span>
                    {cascade.tippingPoint}
                  </div>

                  <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-200">
                    <div className="flex items-center gap-1.5 font-medium text-[11px] text-emerald-300 mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Preventative Tripwire to Set Today:</span>
                    </div>
                    <span className="text-[11px] leading-normal block">
                      {cascade.preventativeTripwire}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis Card */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
            <span className="font-code text-amber-400 block mb-1">
              PRE-MORTEM SYNTHESIS & COMMON THREAD
            </span>
            <p className="text-zinc-300 leading-relaxed text-sm">
              {result.synthesisTakeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
