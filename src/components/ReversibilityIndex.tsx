import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  DoorOpen,
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';
import { ContextDetails } from '../types/decision';

interface ReversibilityIndexProps {
  decisionTitle: string;
  contextDetails: ContextDetails;
  onAttachToNotes?: (text: string) => void;
}

export const ReversibilityIndex: React.FC<ReversibilityIndexProps> = ({
  decisionTitle,
  contextDetails,
  onAttachToNotes,
}) => {
  // Sliders for 4 reversibility dimensions
  const [financialSunkCost, setFinancialSunkCost] = useState<number>(3); // 1 = negligible, 5 = massive irreversible loss
  const [relationshipFriction, setRelationshipFriction] = useState<number>(2); // 1 = friendly, 5 = burned bridge
  const [timeLockinMonths, setTimeLockinMonths] = useState<number>(6); // Duration
  const [resumePivotEase, setResumePivotEase] = useState<number>(4); // 1 = trapped, 5 = highly portable

  // Calculated Reversibility Score (0 to 100)
  // Higher = more two-way door, lower = one-way trap
  const rawScore = 100 - (financialSunkCost * 6) - (relationshipFriction * 8) - (timeLockinMonths * 3) + (resumePivotEase * 8);
  const reversibilityScore = Math.max(10, Math.min(95, rawScore));

  const isOneWayDoor = reversibilityScore < 50;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-code text-cyan-400">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>BEZOS TYPE-1 vs TYPE-2 DECISION AUDITOR</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100">
              Decision Reversibility & Exit Ramp Protocol
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Most paralysis comes from treating reversible (Type 2 "Two-Way Door") decisions as irreversible catastrophes, or vice-versa. Gauge your true reversibility and plan your contingency exit ramp before signing.
            </p>
          </div>

          {/* Reversibility Score Gauge Card */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 text-center min-w-[160px]">
            <span className="text-[10px] font-code text-zinc-400 uppercase block mb-0.5">
              Reversibility Index
            </span>
            <div className={`font-code text-3xl font-bold ${
              reversibilityScore >= 65
                ? 'text-emerald-400'
                : reversibilityScore >= 45
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}>
              {reversibilityScore}%
            </div>
            <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded font-medium ${
              isOneWayDoor
                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isOneWayDoor ? 'Type 1: One-Way Door' : 'Type 2: Two-Way Door'}
            </span>
          </div>
        </div>

        {/* 4 Interactive Dimension Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-medium">
              <span>Financial Sunk Cost</span>
              <span className="font-code text-amber-300">Level {financialSunkCost}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={financialSunkCost}
              onChange={(e) => setFinancialSunkCost(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] text-zinc-500 block">Tuition, lease, equipment</span>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-medium">
              <span>Relationship / Social Risk</span>
              <span className="font-code text-amber-300">Level {relationshipFriction}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={relationshipFriction}
              onChange={(e) => setRelationshipFriction(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] text-zinc-500 block">Advisor trust, cohort ties</span>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-medium">
              <span>Time Commitment Lock</span>
              <span className="font-code text-cyan-300">{timeLockinMonths} Months</span>
            </div>
            <input
              type="range"
              min="1"
              max="18"
              value={timeLockinMonths}
              onChange={(e) => setTimeLockinMonths(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-zinc-500 block">Duration of agreement</span>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-zinc-300 font-medium">
              <span>Skill & Resume Portability</span>
              <span className="font-code text-emerald-300">Level {resumePivotEase}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={resumePivotEase}
              onChange={(e) => setResumePivotEase(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[10px] text-zinc-500 block">Transferability to next role</span>
          </div>
        </div>
      </div>

      {/* Exit Ramp Protocol (Graceful Contingency Roadmap) */}
      <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-code text-amber-400">
          <DoorOpen className="w-3.5 h-3.5" />
          <span>GRACEFUL CONTINGENCY PROTOCOL (THE 30-DAY ESCAPE HATCH)</span>
        </div>

        <h3 className="font-serif-display text-xl text-zinc-100">
          What happens if you commit and discover it was the wrong call?
        </h3>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          Decisions lose their terror when you have already scripted your departure protocol. Here is the step-by-step graceful exit strategy:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="font-code text-[11px] text-cyan-400 font-bold">
              PHASE 1: WEEK 0 - 3
            </div>
            <h4 className="font-semibold text-zinc-100 text-xs">Baseline Calibration Check</h4>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Keep an unedited weekly log. If mentorship is absent and daily tasks are purely clerical data cleaning by day 20, schedule an alignment 1-on-1 immediately rather than suffering quietly for 6 months.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="font-code text-[11px] text-amber-400 font-bold">
              PHASE 2: WEEK 4 - 6
            </div>
            <h4 className="font-semibold text-zinc-100 text-xs">The Structured Course-Correction</h4>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Present a concise 3-bullet proposal: "To maximize value for the team and balance my thesis timeline, I'd like to shift my sprint scope to X." If rejected, trigger Phase 3.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="font-code text-[11px] text-emerald-400 font-bold">
              PHASE 3: EXIT WITH INTEGRITY
            </div>
            <h4 className="font-semibold text-zinc-100 text-xs">The Bridge-Preserving Handover</h4>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Give a polite 3-week transition notice: "Due to unforeseen academic graduation scheduling constraints, I must conclude by date X. I have drafted comprehensive documentation and onboarding guides for my successor."
            </p>
          </div>
        </div>

        {onAttachToNotes && (
          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-[11px] text-zinc-500 italic">
              Confidence increases when worst-case containment is already decided.
            </span>
            <button
              type="button"
              onClick={() =>
                onAttachToNotes(
                  `• Reversibility Audit: Calculated Reversibility Index at ${reversibilityScore}% (${isOneWayDoor ? 'Type 1 Door' : 'Type 2 Door'}). Contingency Exit Ramp established.`
                )
              }
              className="text-amber-400 hover:text-amber-300 font-medium text-[11px] cursor-pointer"
            >
              Attach Reversibility Index to Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
