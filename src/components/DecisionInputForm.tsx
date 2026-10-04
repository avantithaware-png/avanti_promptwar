import React, { useState } from 'react';
import { EXEMPLARS, Exemplar } from '../data/exemplars';
import { ContextDetails } from '../types/decision';
import { MotionHeroAperture } from './MotionHeroAperture';
import { Sparkles, ArrowRight, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface DecisionInputFormProps {
  onSubmit: (formData: {
    decisionTitle: string;
    currentLeaning: string;
    preConfidence: number;
    primaryReasons: string;
    contextDetails: ContextDetails;
    alreadyConsidered: string;
  }) => void;
  isLoading: boolean;
}

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [selectedExemplarId, setSelectedExemplarId] = useState<string>('');
  const [decisionTitle, setDecisionTitle] = useState<string>('');
  const [currentLeaning, setCurrentLeaning] = useState<string>('Leaning toward doing it');
  const [preConfidence, setPreConfidence] = useState<number>(75);
  const [primaryReasons, setPrimaryReasons] = useState<string>('');
  const [alreadyConsidered, setAlreadyConsidered] = useState<string>('');
  const [showAdvancedContext, setShowAdvancedContext] = useState<boolean>(true);

  // Context Details
  const [domainOrRole, setDomainOrRole] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('');
  const [financials, setFinancials] = useState<string>('');
  const [workloadOrHours, setWorkloadOrHours] = useState<string>('');
  const [locationOrCommute, setLocationOrCommute] = useState<string>('');
  const [academicOrCareerSchedule, setAcademicOrCareerSchedule] = useState<string>('');
  const [otherConstraints, setOtherConstraints] = useState<string>('');

  const loadExemplar = (ex: Exemplar) => {
    setSelectedExemplarId(ex.id);
    setDecisionTitle(ex.title);
    setCurrentLeaning(ex.currentLeaning);
    setPreConfidence(ex.preConfidence || 75);
    setPrimaryReasons(ex.primaryReasons);
    setAlreadyConsidered(ex.alreadyConsidered);

    setDomainOrRole(ex.contextDetails.domainOrRole || '');
    setTimeframe(ex.contextDetails.timeframe || '');
    setFinancials(ex.contextDetails.financials || '');
    setWorkloadOrHours(ex.contextDetails.workloadOrHours || '');
    setLocationOrCommute(ex.contextDetails.locationOrCommute || '');
    setAcademicOrCareerSchedule(ex.contextDetails.academicOrCareerSchedule || '');
    setOtherConstraints(ex.contextDetails.otherConstraints || '');
    setShowAdvancedContext(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim() || !primaryReasons.trim()) return;

    onSubmit({
      decisionTitle,
      currentLeaning,
      preConfidence,
      primaryReasons,
      contextDetails: {
        domainOrRole,
        timeframe,
        financials,
        workloadOrHours,
        locationOrCommute,
        academicOrCareerSchedule,
        otherConstraints,
      },
      alreadyConsidered,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Editorial Hero Intro */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-code mb-2">
          <span>COGNITIVE AUDIT</span>
          <span aria-hidden="true">·</span>
          <span>REASONING DIAGNOSTICS</span>
          <span aria-hidden="true">·</span>
          <span>NON-PRESCRIPTIVE</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-5xl text-zinc-100 font-normal tracking-tight max-w-3xl leading-[1.15]">
          Uncover the invisible premises behind your next major decision.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
          When choices feel obvious, we are usually anchored to what is most visible: salary, proximity, immediate prestige, or urgency. 
          Aperture inspects your unstated assumptions and quiet second-order trade-offs.
        </p>
      </div>

      {/* Interactive Motion Hero: The Optical Aperture */}
      <MotionHeroAperture />

      {/* Case Study Preset Selector */}
      <div className="mb-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Exemplar Scenarios & Prompts</span>
          </div>
          <span className="text-[11px] text-zinc-500">Click any case to populate the blueprint</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EXEMPLARS.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => loadExemplar(ex)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedExemplarId === ex.id
                  ? 'bg-amber-950/20 border-amber-500/50 text-amber-100 shadow-sm'
                  : 'bg-zinc-950/40 border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                <span className="font-code text-amber-400/90">{ex.badge}</span>
                {selectedExemplarId === ex.id && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Loaded
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-zinc-100 line-clamp-1">{ex.title}</div>
              <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{ex.tagline}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Decision Question */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-wide text-zinc-200 uppercase mb-1">
              01. The Decision Under Consideration <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              State the specific choice, offer, or crossroads you are evaluating.
            </p>
            <input
              type="text"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              placeholder="e.g., Accepting a 6-month full-time internship offer at XYZ Corp during my junior year"
              required
              className="w-full px-3.5 py-2.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>

          {/* Preliminary Leaning */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-zinc-200 uppercase mb-1">
              Initial Stance / Gut Leaning
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Leaning toward doing it',
                'Completely torn / 50-50',
                'Leaning against / skeptical',
              ].map((stance) => (
                <button
                  key={stance}
                  type="button"
                  onClick={() => setCurrentLeaning(stance)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${
                    currentLeaning === stance
                      ? 'bg-amber-500/10 border-amber-500/60 text-amber-200'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {stance}
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Analysis Confidence Self-Rating */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold tracking-wide text-zinc-200 uppercase text-[11px]">
                Initial Confidence in this Choice (Pre-Analysis)
              </label>
              <span className="font-code text-amber-300 font-bold text-sm">
                {preConfidence}%
              </span>
            </div>

            {/* Visual Gauge / Progress Track */}
            <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-zinc-500 via-amber-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.max(preConfidence, 3), 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                {preConfidence <= 25
                  ? 'High Ambiguity / Skeptical'
                  : preConfidence <= 50
                  ? 'Hesitant / Many Questions'
                  : preConfidence <= 75
                  ? 'Moderately Confident'
                  : 'Very Confident / Strong Pull'}
              </span>
              <span className="text-zinc-500 italic">Drag slider to self-rate</span>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={preConfidence}
              onChange={(e) => setPreConfidence(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Primary Stated Reasons */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold tracking-wide text-zinc-200 uppercase">
                02. Primary Stated Reasons & Highly Visible Factors <span className="text-amber-400">*</span>
              </label>
              <span className="text-[11px] text-amber-400/80 font-code">THE "SALIENT" DATA</span>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              What are the top 2-3 reasons driving your interest? (e.g. stipend, proximity to home, resume brand, exciting title)
            </p>
            <textarea
              rows={3}
              value={primaryReasons}
              onChange={(e) => setPrimaryReasons(e.target.value)}
              placeholder="e.g., The stipend is great ($35/hr), the company is only 15 minutes away from home, and it will give me real industry experience on my resume."
              required
              className="w-full px-3.5 py-2.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Detailed Context Blueprint */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wide text-zinc-200 uppercase block">
                03. Context, Schedules & Realities
              </span>
              <p className="text-xs text-zinc-400">
                Supply the concrete constraints so Aperture can spot schedule clashes and trade-offs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedContext(!showAdvancedContext)}
              className="text-xs text-amber-400/90 hover:text-amber-300 font-medium"
            >
              {showAdvancedContext ? 'Collapse Context' : 'Expand Context'}
            </button>
          </div>

          {showAdvancedContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Academic / Career Schedule
                </label>
                <input
                  type="text"
                  value={academicOrCareerSchedule}
                  onChange={(e) => setAcademicOrCareerSchedule(e.target.value)}
                  placeholder="e.g., Junior year, 16 credit hours required, graduation in May"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Workload & Hours Expected
                </label>
                <input
                  type="text"
                  value={workloadOrHours}
                  onChange={(e) => setWorkloadOrHours(e.target.value)}
                  placeholder="e.g., 40 hrs/wk, 8:30 AM - 5:00 PM, 4 days in-person"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Financials & Compensation
                </label>
                <input
                  type="text"
                  value={financials}
                  onChange={(e) => setFinancials(e.target.value)}
                  placeholder="e.g., $35/hr stipend, health insurance considerations"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Location & Commute Details
                </label>
                <input
                  type="text"
                  value={locationOrCommute}
                  onChange={(e) => setLocationOrCommute(e.target.value)}
                  placeholder="e.g., 15-minute drive from parents' house"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Other Constraints or Commitments
                </label>
                <input
                  type="text"
                  value={otherConstraints}
                  onChange={(e) => setOtherConstraints(e.target.value)}
                  placeholder="e.g., University policy on taking leave of absence, prerequisite course sequencing"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>
            </div>
          )}
        </div>

        {/* What You Already Considered */}
        <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm">
          <label className="block text-xs font-semibold tracking-wide text-zinc-200 uppercase mb-1">
            04. What Have You Already Factored In?
          </label>
          <p className="text-xs text-zinc-400 mb-2">
            Tell Aperture what obvious trade-offs you are already comfortable with, so it delves deeper into the genuine unknown.
          </p>
          <input
            type="text"
            value={alreadyConsidered}
            onChange={(e) => setAlreadyConsidered(e.target.value)}
            placeholder="e.g., I already know I won't have time for social clubs and will be tired in evenings."
            className="w-full px-3.5 py-2.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <AlertCircle className="w-4 h-4 text-amber-400/80 shrink-0" />
            <span>Aperture will not vote or choose for you. It will expose what you cannot yet see.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !decisionTitle.trim() || !primaryReasons.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold rounded-lg shadow-lg hover:shadow-amber-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Auditing Reasoning...</span>
              </span>
            ) : (
              <>
                <span>Diagnose Blind Spots</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
