import React, { useState, useEffect } from 'react';
import { HiddenAssumption, AssumptionStressTestResult } from '../types/decision';
import { X, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface StressTestModalProps {
  decisionTitle: string;
  assumption: HiddenAssumption | null;
  onClose: () => void;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  decisionTitle,
  assumption,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AssumptionStressTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assumption) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch('/api/stress-test-assumption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decisionTitle,
        assumption: assumption.assumption,
        vulnerability: assumption.vulnerability,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to stress-test assumption.');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setResult(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [assumption, decisionTitle]);

  if (!assumption) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#12151c] border border-zinc-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs font-code text-amber-400 mb-1">
            <span>ASSUMPTION STRESS-TEST</span>
            <span aria-hidden="true">·</span>
            <span>FRAGILITY AUDIT</span>
          </div>
          <h2 className="font-serif-display text-2xl text-zinc-100">
            Testing Implicit Premise
          </h2>
        </div>

        {/* The Assumption in question */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 mb-5 text-xs space-y-1.5">
          <div className="text-zinc-400 font-medium">Stated or Unstated Assumption:</div>
          <div className="text-zinc-100 font-medium text-sm leading-relaxed">
            "{assumption.assumption}"
          </div>
          <div className="text-amber-300/80 pt-1">
            Known vulnerability: {assumption.vulnerability}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">
              Running inversion tests and calculating fragility thresholds...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-950/30 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        ) : result ? (
          <div className="space-y-4 text-xs">
            {/* 1. Inversion Test */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 font-semibold text-rose-300 mb-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>The Inversion Test (What If the Exact Opposite Is True?)</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {result.inversionTest}
              </p>
            </div>

            {/* 2. Fragility Indicators */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Early Warning Indicators (Signs This Assumption Is Collapsing)</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                {result.fragilityIndicators.map((ind, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-code shrink-0">·</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Safeguards */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Practical Safeguards & Hedging Mechanisms</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300">
                {result.safeguards.map((safe, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-code shrink-0">·</span>
                    <span>{safe}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. The Reality Check Question */}
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/30">
              <div className="text-amber-300 font-semibold mb-1">
                The Reality-Check Question:
              </div>
              <p className="text-sm text-zinc-100 font-serif-display italic">
                "{result.realityCheckQuestion}"
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition-colors"
          >
            Close Stress-Test
          </button>
        </div>
      </div>
    </div>
  );
};
