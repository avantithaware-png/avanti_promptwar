import React from 'react';
import { Gauge, TrendingDown, TrendingUp, Minus, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceGaugeProps {
  preConfidence: number; // 0 - 100
  postConfidence: number; // 0 - 100
  onChangePostConfidence?: (val: number) => void;
  readOnly?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  preConfidence,
  postConfidence,
  onChangePostConfidence,
  readOnly = false,
}) => {
  const delta = postConfidence - preConfidence;

  const getConfidenceLabel = (val: number) => {
    if (val <= 25) return 'Low Conviction / High Ambiguity';
    if (val <= 50) return 'Cautious Hesitation / Open Questions';
    if (val <= 75) return 'Moderate Leaning / Preliminary Support';
    return 'High Conviction / Strong Inclination';
  };

  const getDeltaInterpretation = () => {
    if (delta < -15) {
      return {
        label: `${delta}% Productive Doubt (De-biasing)`,
        color: 'text-amber-300',
        bg: 'bg-amber-950/20 border-amber-500/30',
        icon: <TrendingDown className="w-3.5 h-3.5 text-amber-400" />,
        text: 'A decrease in confidence is normal and healthy. It indicates that you have pierced the veil of initial salience bias and are confronting previously invisible operational risks.',
      };
    }
    if (delta > 15) {
      return {
        label: `+${delta}% Stress-Tested Resolve`,
        color: 'text-emerald-300',
        bg: 'bg-emerald-950/20 border-emerald-500/30',
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
        text: 'Your confidence increased after inspection. Ensure this reflects verified safeguards and factual due diligence rather than defensive confirmation bias.',
      };
    }
    if (delta !== 0) {
      return {
        label: `${delta > 0 ? '+' : ''}${delta}% Subtle Shift`,
        color: 'text-cyan-300',
        bg: 'bg-cyan-950/20 border-cyan-500/30',
        icon: delta > 0 ? <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> : <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />,
        text: 'Your confidence held relatively steady while sharpening awareness of trade-offs and alternative third ways.',
      };
    }
    return {
      label: 'Equilibrium (0% Delta)',
      color: 'text-zinc-400',
      bg: 'bg-zinc-900 border-zinc-800',
      icon: <Minus className="w-3.5 h-3.5 text-zinc-400" />,
      text: 'Confidence is currently unchanged. Try answering the Socratic inquiries or running a Pre-Mortem to test edge-case risks.',
    };
  };

  const interpretation = getDeltaInterpretation();

  return (
    <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span className="font-code text-xs text-amber-400">EVALUATION METRIC</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <h3 className="font-serif-display text-lg text-zinc-100">
              Confidence Calibration Gauge
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Self-rated conviction before vs after examining blind spots and hidden assumptions.
          </p>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-code border flex items-center gap-1.5 self-start sm:self-auto ${interpretation.bg}`}>
          {interpretation.icon}
          <span className={interpretation.color}>{interpretation.label}</span>
        </div>
      </div>

      {/* Dual Progress Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Before Analysis */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              Initial Confidence (Pre-Analysis)
            </span>
            <span className="font-code text-zinc-200 font-semibold text-sm">
              {preConfidence}%
            </span>
          </div>

          {/* Gauge / Progress Bar */}
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-zinc-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(preConfidence, 3), 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{getConfidenceLabel(preConfidence)}</span>
            <span className="italic">Anchored on visible factors</span>
          </div>
        </div>

        {/* After Analysis */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-medium">
              Calibrated Confidence (Post-Audit)
            </span>
            <span className="font-code text-amber-300 font-semibold text-sm">
              {postConfidence}%
            </span>
          </div>

          {/* Gauge / Progress Bar */}
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                postConfidence < preConfidence
                  ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(Math.max(postConfidence, 3), 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">{getConfidenceLabel(postConfidence)}</span>
            {!readOnly && (
              <span className="text-amber-400/90 font-code text-[10px]">
                SLIDER ADJUSTABLE BELOW
              </span>
            )}
          </div>

          {/* Interactive Slider if not read-only */}
          {!readOnly && onChangePostConfidence && (
            <div className="pt-2 border-t border-zinc-800/60 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>0% (Paralyzed / Rethinking)</span>
                <span>50% (Torn)</span>
                <span>100% (Fully Prepared)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={postConfidence}
                onChange={(e) => onChangePostConfidence(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Epistemic Reflection Note */}
      <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-200">Critical Calibration Insight: </strong>
          {interpretation.text}
        </p>
      </div>
    </div>
  );
};
