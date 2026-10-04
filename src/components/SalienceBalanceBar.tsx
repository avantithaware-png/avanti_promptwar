import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Waves, Sparkles, ChevronDown } from 'lucide-react';
import { ExecutiveMirror } from '../types/decision';
import icebergImage from '../assets/images/cognitive_iceberg_1791099656829.jpg';

interface SalienceBalanceBarProps {
  executiveMirror: ExecutiveMirror;
}

export const SalienceBalanceBar: React.FC<SalienceBalanceBarProps> = ({ executiveMirror }) => {
  const [showImageDetails, setShowImageDetails] = useState(true);

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm mb-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase font-code">
            The Salience Imbalance
          </span>
          <p className="text-xs text-zinc-400 mt-0.5">
            Decisions fail when prominent, immediate signals crowd out silent, long-range fundamentals.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-code text-[11px] text-amber-400/90">
            VISIBLE TIP vs SUBMERGED BULK
          </span>
        </div>
      </div>

      {/* Motion Visual: The Cognitive Iceberg Banner */}
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 h-44 sm:h-52 w-full group">
        <motion.img
          src={icebergImage}
          alt="The Decision Iceberg: Visible Tip versus Submerged Realities"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          animate={{
            scale: [1, 1.04, 1],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Dynamic Waterline Wave Animation */}
        <div className="absolute top-[38%] inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none">
          <motion.div
            className="w-full h-full bg-cyan-300/40 blur-xs"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleX: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-[#12151c]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12151c]/80 via-transparent to-[#12151c]/80" />

        {/* Floating Annotations on the Image */}
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-code bg-amber-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-sm flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>ABOVE WATERLINE: 15% VISIBLE ANCHORS</span>
          </span>
        </div>

        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-code bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 backdrop-blur-sm flex items-center gap-1">
            <Waves className="w-3 h-3" />
            <span>SUBMERGED: 85% HIDDEN ASSUMPTIONS & COSTS</span>
          </span>
        </div>

        {/* Center Prompt Tag */}
        <div className="absolute inset-x-4 bottom-3 left-4 max-w-md hidden sm:block">
          <p className="text-[11px] text-zinc-300 italic backdrop-blur-xs">
            "We fixate on the visible peak because it is easy to measure, while the submerged base determines whether the structure floats or sinks."
          </p>
        </div>
      </div>

      {/* Structured Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Over-weighted / Visible */}
        <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Visible Anchors (Over-weighted in Reasoning)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {executiveMirror.overweightedFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-code shrink-0">·</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Under-weighted / Quiet */}
        <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-cyan-300">
            <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
            <span>Submerged Factors (Under-weighted in Reasoning)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {executiveMirror.underweightedFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-code shrink-0">·</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
