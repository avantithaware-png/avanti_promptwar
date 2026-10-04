import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scan, Eye, Sparkles, Compass, ShieldAlert, Radio } from 'lucide-react';
import heroImage from '../assets/images/hero_aperture_lens_1791099640884.jpg';

interface MotionHeroApertureProps {
  onQuickStart?: () => void;
}

export const MotionHeroAperture: React.FC<MotionHeroApertureProps> = ({ onQuickStart }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = [
    {
      id: 1,
      x: '28%',
      y: '38%',
      tag: 'Visible Salience',
      label: 'Tangible Stipend & Commute',
      description: 'Prominent signals that monopolize initial cognitive focus.',
      color: 'border-amber-400 text-amber-300 bg-amber-950/80',
    },
    {
      id: 2,
      x: '68%',
      y: '58%',
      tag: 'Submerged Blind Spot',
      label: 'Prerequisite Chain Disruption',
      description: 'Hidden second-order delays to graduation and cohort momentum.',
      color: 'border-cyan-400 text-cyan-300 bg-cyan-950/80',
    },
    {
      id: 3,
      x: '48%',
      y: '72%',
      tag: 'Fragile Assumption',
      label: 'Mentorship Availability',
      description: 'Assuming company reputation guarantees dedicated daily guidance.',
      color: 'border-rose-400 text-rose-300 bg-rose-950/80',
    },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800/90 shadow-2xl mb-8 group bg-[#0e1117]">
      {/* Background Animated Image with Ken-Burns and Ambient Glow */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
        <motion.img
          src={heroImage}
          alt="Aperture Optical Prism Revealing Unseen Realities"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          animate={{
            scale: [1, 1.05, 1],
            filter: [
              'brightness(0.85) contrast(1.1)',
              'brightness(0.95) contrast(1.15)',
              'brightness(0.85) contrast(1.1)',
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cinematic Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e12]/80 via-transparent to-[#0c0e12]/70" />

        {/* Animated Scanner Laser Sweep */}
        {isScanning && (
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_15px_#f59e0b] pointer-events-none"
            animate={{
              top: ['0%', '100%', '0%'],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Pulsing Concentric Radar Rings in Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-amber-400/20"
            animate={{
              scale: [0.8, 1.4, 0.8],
              opacity: [0.4, 0.05, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-400/25"
            animate={{
              scale: [1.2, 0.7, 1.2],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Interactive Floating Hotspots on Image */}
        {hotspots.map((hs) => (
          <div
            key={hs.id}
            style={{ left: hs.x, top: hs.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onMouseEnter={() => setActiveHotspot(hs.id)}
            onMouseLeave={() => setActiveHotspot(null)}
          >
            <motion.div
              className="relative flex items-center justify-center"
              whileHover={{ scale: 1.15 }}
            >
              <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-300/80 flex items-center justify-center text-[10px] text-amber-200 font-bold shadow-lg backdrop-blur-sm">
                0{hs.id}
              </span>
              <span className="absolute -inset-1 rounded-full border border-amber-400/40 animate-ping pointer-events-none" />

              {/* Tooltip on Hover / Focus */}
              {activeHotspot === hs.id && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-56 p-3 rounded-lg border shadow-2xl z-30 text-xs backdrop-blur-md ${hs.color}`}
                >
                  <div className="font-code text-[10px] uppercase tracking-wider mb-0.5 opacity-80">
                    {hs.tag}
                  </div>
                  <div className="font-semibold text-zinc-100 text-xs leading-snug">
                    {hs.label}
                  </div>
                  <div className="text-[11px] text-zinc-300 mt-1 leading-tight">
                    {hs.description}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}

        {/* Overlay Badges and Scanner Status */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScanning(!isScanning)}
            className="px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-700/80 hover:border-amber-400/60 text-zinc-300 hover:text-white text-[11px] font-code flex items-center gap-1.5 transition-colors backdrop-blur-sm"
          >
            <Radio className={`w-3 h-3 ${isScanning ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>{isScanning ? 'RADAR ACTIVE' : 'RADAR PAUSED'}</span>
          </button>
        </div>

        {/* Bottom Hero Overlay Content */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-code text-amber-400 mb-1">
              <Scan className="w-3.5 h-3.5" />
              <span>DYNAMIC COGNITIVE APERTURE</span>
            </div>
            <h2 className="font-serif-display text-lg sm:text-2xl text-zinc-100 font-medium leading-tight">
              Illuminating what prominent data obscures.
            </h2>
            <p className="text-xs text-zinc-300 mt-1 hidden sm:block leading-relaxed">
              Hover over the animated scan nodes to preview how visible anchors hide foundational risks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-code text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800 backdrop-blur-sm">
              3 LAYERS DETECTED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
