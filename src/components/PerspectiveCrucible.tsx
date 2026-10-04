import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StakeholderPerspective, ContextDetails } from '../types/decision';
import { Users, GraduationCap, Clock, Award, ShieldAlert, Sparkles, MessageCircleQuestion, Compass } from 'lucide-react';
import crossroadsImage from '../assets/images/socratic_crossroads_1791099671324.jpg';

interface PerspectiveCrucibleProps {
  decisionTitle: string;
  primaryReasons: string;
  contextDetails: ContextDetails;
}

export const PerspectiveCrucible: React.FC<PerspectiveCrucibleProps> = ({
  decisionTitle,
  primaryReasons,
  contextDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [perspectives, setPerspectives] = useState<StakeholderPerspective[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPerspectives = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/perspective-crucible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          primaryReasons,
          contextDetails,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate stakeholder perspectives.');
      const data = await res.json();
      setPerspectives(data.perspectives);
    } catch (err: any) {
      setError(err.message || 'Error generating perspectives.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForRole = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes('academic') || lower.includes('dean') || lower.includes('advisor')) {
      return <GraduationCap className="w-4 h-4 text-purple-400" />;
    }
    if (lower.includes('future') || lower.includes('5 year')) {
      return <Clock className="w-4 h-4 text-amber-400" />;
    }
    if (lower.includes('veteran') || lower.includes('executive') || lower.includes('manager')) {
      return <Award className="w-4 h-4 text-blue-400" />;
    }
    return <ShieldAlert className="w-4 h-4 text-rose-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Visual Motion Banner: The Crossroads */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 h-48 sm:h-60 w-full group">
        <motion.img
          src={crossroadsImage}
          alt="Divergent horizons and stakeholder perspectives"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-110"
          animate={{
            scale: [1, 1.04, 1],
            x: [0, -4, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-[#12151c]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12151c]/90 via-transparent to-[#12151c]/70" />

        {/* Floating Animated Beams */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-transparent pointer-events-none"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-code text-purple-400">
              <Users className="w-3.5 h-3.5" />
              <span>COGNITIVE DE-CENTERING EXERCISE</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100 font-medium">
              The Perspective Crucible
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Step outside your own ego-defensive narrative and see how four critical archetypes view your trade-offs.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPerspectives}
            disabled={loading}
            className="px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0 backdrop-blur-sm"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                <span>Simulating External Lenses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{perspectives ? 'Re-examine Lenses' : 'Step into Other Perspectives'}</span>
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

      {/* Perspectives Grid with Motion Entrance */}
      {perspectives && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perspectives.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  {getIconForRole(p.role)}
                  <span className="text-xs font-semibold text-zinc-200">{p.role}</span>
                </div>
                <h3 className="font-serif-display text-lg text-zinc-100">
                  {p.lensTitle}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {p.coreWorryOrInsight}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/90 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-amber-300 text-[11px]">
                  <MessageCircleQuestion className="w-3.5 h-3.5" />
                  <span>The Uncomfortable Question They Ask You:</span>
                </div>
                <p className="text-zinc-200 italic font-serif-display leading-relaxed">
                  "{p.uncomfortableQuestion}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
