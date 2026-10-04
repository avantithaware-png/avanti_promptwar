import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Scale,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Compass,
  Calculator,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { NearbyLocationScout } from './NearbyLocationScout';
import { ContextDetails } from '../types/decision';

interface OpportunityIntelligenceHubProps {
  decisionTitle: string;
  contextDetails: ContextDetails;
  onAttachToNotes?: (text: string) => void;
}

interface JobOpportunity {
  companyType: string;
  typicalRole: string;
  expectedStipendRange: string;
  pros: string;
  hiddenCons: string;
  hiringCriteria: string;
}

interface StipendBenchmark {
  medianHourlyRate: string;
  p25Hourly: string;
  p50Hourly: string;
  p75Hourly: string;
  p90Hourly: string;
  estimatedMonthlyGross: string;
  estimatedNetTakeHomePercent: string;
  hiddenFinancialTraps: string[];
  livingCostFactor: string;
}

interface OpportunitySynthesis {
  marketClarityNote: string;
  negotiationLever: string;
}

export const OpportunityIntelligenceHub: React.FC<OpportunityIntelligenceHubProps> = ({
  decisionTitle,
  contextDetails,
  onAttachToNotes,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<
    'locations' | 'jobs' | 'stipend' | 'matrix'
  >('locations');

  // Market intelligence state
  const [loadingMarket, setLoadingMarket] = useState<boolean>(false);
  const [marketData, setMarketData] = useState<{
    jobOpportunities: JobOpportunity[];
    stipendBenchmark: StipendBenchmark;
    opportunitySynthesis: OpportunitySynthesis;
  } | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);

  // Interactive Stipend Calculator State
  const [hourlyRate, setHourlyRate] = useState<number>(35);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [monthlyCommuteCost, setMonthlyCommuteCost] = useState<number>(180);
  const [delayedGraduationSemesters, setDelayedGraduationSemesters] = useState<number>(1);
  const [semesterTuitionCost, setSemesterTuitionCost] = useState<number>(6500);

  // Parse default stipend from contextDetails if present
  useEffect(() => {
    if (contextDetails.financials) {
      const match = contextDetails.financials.match(/\$?(\d+)(?:\/hr|\s*per hour)?/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0 && parsed < 200) {
          setHourlyRate(parsed);
        }
      }
    }
  }, [contextDetails.financials]);

  const fetchMarketIntelligence = async () => {
    setLoadingMarket(true);
    setMarketError(null);
    try {
      const res = await fetch('/api/opportunity-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle,
          roleOrDomain: contextDetails.domainOrRole || 'Software Engineering / Tech',
          locationOrCity: contextDetails.locationOrCommute || 'General Tech Market',
          currentFinancials: contextDetails.financials || `$${hourlyRate}/hr`,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to retrieve market opportunities.');
      }

      const data = await res.json();
      setMarketData(data);
    } catch (err: any) {
      setMarketError(err.message || 'Error loading market intelligence.');
    } finally {
      setLoadingMarket(false);
    }
  };

  // Calculations for calculator
  const monthlyGross = Math.round(hourlyRate * hoursPerWeek * 4.33);
  const estimatedTaxDeduction = Math.round(monthlyGross * 0.22); // ~22% blended effective tax/FICA
  const netTakeHome = Math.max(0, monthlyGross - estimatedTaxDeduction - monthlyCommuteCost);
  const totalStipend6Months = netTakeHome * 6;
  const delayedCost = delayedGraduationSemesters * semesterTuitionCost;
  const trueNetFinancialGain = totalStipend6Months - delayedCost;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Header */}
      <div className="p-6 rounded-2xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-code text-amber-400">
              <Compass className="w-3.5 h-3.5" />
              <span>MARKET REALITY CHECK & LOGISTICS HUB</span>
            </div>
            <h2 className="font-serif-display text-2xl text-zinc-100 mt-1">
              Locations, Opportunities & Compensation Intelligence
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed mt-0.5">
              Probe beyond the surface offer. Cross-examine physical commute feasibility, local benchmark hiring opportunities, and unvarnished stipend net-take-home.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!marketData && (
              <button
                type="button"
                onClick={fetchMarketIntelligence}
                disabled={loadingMarket}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {loadingMarket ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Benchmarks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Market Intelligence</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveSubSection('locations')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubSection === 'locations'
                ? 'bg-[#181c26] border-emerald-500/60 text-emerald-300 shadow-md'
                : 'bg-zinc-900/40 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>01. Nearby Locations</span>
            </div>
            <p className="text-[10px] text-zinc-500">Google Maps grounded top 3</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubSection('jobs');
              if (!marketData && !loadingMarket) fetchMarketIntelligence();
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubSection === 'jobs'
                ? 'bg-[#181c26] border-blue-500/60 text-blue-300 shadow-md'
                : 'bg-zinc-900/40 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs mb-0.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>02. Job Opportunities</span>
            </div>
            <p className="text-[10px] text-zinc-500">Local hiring benchmarks</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubSection('stipend');
              if (!marketData && !loadingMarket) fetchMarketIntelligence();
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubSection === 'stipend'
                ? 'bg-[#181c26] border-amber-500/60 text-amber-300 shadow-md'
                : 'bg-zinc-900/40 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>03. Stipend Reality Check</span>
            </div>
            <p className="text-[10px] text-zinc-500">Interactive net gain calc</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('matrix')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeSubSection === 'matrix'
                ? 'bg-[#181c26] border-purple-500/60 text-purple-300 shadow-md'
                : 'bg-zinc-900/40 border-zinc-800/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium text-xs mb-0.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>04. Comparative Matrix</span>
            </div>
            <p className="text-[10px] text-zinc-500">Offer vs alternatives</p>
          </button>
        </div>
      </div>

      {marketError && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{marketError}</span>
        </div>
      )}

      {/* SECTION 1: NEARBY LOCATIONS & WORKSPACES */}
      {activeSubSection === 'locations' && (
        <div className="space-y-4 animate-fade-in">
          <NearbyLocationScout
            decisionTitle={decisionTitle}
            defaultLocation={contextDetails.locationOrCommute || ''}
            onAttachToNotes={onAttachToNotes}
          />
        </div>
      )}

      {/* SECTION 2: JOB & INTERNSHIP OPPORTUNITIES */}
      {activeSubSection === 'jobs' && (
        <div className="space-y-5 animate-fade-in">
          {!marketData && loadingMarket && (
            <div className="p-12 text-center rounded-xl bg-[#12151c] border border-zinc-800 text-xs text-zinc-400">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Auditing regional job opportunities and internship benchmarks...</p>
            </div>
          )}

          {!marketData && !loadingMarket && (
            <div className="p-10 text-center rounded-xl bg-[#12151c] border border-zinc-800 space-y-3">
              <Briefcase className="w-8 h-8 text-blue-400 mx-auto" />
              <h3 className="font-serif-display text-lg text-zinc-100">
                Unlock Job & Internship Market Intelligence
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Compare your current offer against 4 typical opportunity archetypes in this sector to ensure you aren't settling prematurely.
              </p>
              <button
                type="button"
                onClick={fetchMarketIntelligence}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Scan Job Opportunities
              </button>
            </div>
          )}

          {marketData && (
            <div className="space-y-5">
              {/* Market Synthesis Brief */}
              <div className="p-5 rounded-xl bg-[#12151c] border border-blue-500/30 shadow-sm flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-blue-300 uppercase tracking-wider font-code text-[11px]">
                    Market Landscape Diagnosis
                  </span>
                  <p className="text-zinc-200 leading-relaxed">
                    {marketData.opportunitySynthesis.marketClarityNote}
                  </p>
                </div>
              </div>

              {/* Archetypes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketData.jobOpportunities.map((job, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 hover:border-zinc-700 flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-code text-blue-400 text-[11px] font-semibold">
                          {job.companyType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-code text-[11px]">
                          {job.expectedStipendRange}
                        </span>
                      </div>

                      <h3 className="font-serif-display text-lg text-zinc-100 font-medium">
                        {job.typicalRole}
                      </h3>

                      <div className="pt-2 space-y-2 text-xs">
                        <div className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                          <span className="text-[11px] font-semibold text-emerald-400 block mb-0.5">
                            Key Upside:
                          </span>
                          <span className="text-zinc-300">{job.pros}</span>
                        </div>

                        <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30">
                          <span className="text-[11px] font-semibold text-rose-300 block mb-0.5">
                            Hidden Trade-off / Blind Spot:
                          </span>
                          <span className="text-zinc-300">{job.hiddenCons}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-medium text-zinc-300">Criteria:</span>
                      <span className="truncate max-w-[240px] text-right">{job.hiringCriteria}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: STIPEND & COMPENSATION REALITY CHECK */}
      {activeSubSection === 'stipend' && (
        <div className="space-y-6 animate-fade-in">
          {/* Interactive Net Compensation Calculator */}
          <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-code text-amber-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>INTERACTIVE COMPENSATION AUDITOR</span>
                </div>
                <h3 className="font-serif-display text-xl text-zinc-100 mt-0.5">
                  The Real Net Financial Yield (Gross vs True Discretionary)
                </h3>
              </div>
              <span className="text-xs font-code text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                DYNAMIC FORMULA
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-medium">Hourly Stipend Rate</label>
                  <span className="font-code font-bold text-amber-300 text-sm">${hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="80"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-zinc-500 block">Stated offer rate</span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-medium">Workload (Hours/Week)</label>
                  <span className="font-code font-bold text-zinc-200 text-sm">{hoursPerWeek} hrs</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-zinc-500 block">Full-time standard is 40h</span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-medium">Monthly Commute / Transit</label>
                  <span className="font-code font-bold text-zinc-200 text-sm">${monthlyCommuteCost}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="20"
                  value={monthlyCommuteCost}
                  onChange={(e) => setMonthlyCommuteCost(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-zinc-500 block">Gas, parking, transit passes</span>
              </div>
            </div>

            {/* Opportunity Cost / Delayed Graduation Factor */}
            <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-medium text-zinc-300 block mb-1">
                  Delayed Graduation Semesters: {delayedGraduationSemesters} term
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={delayedGraduationSemesters}
                  onChange={(e) => setDelayedGraduationSemesters(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Does taking this full-time role delay your degree?
                </span>
              </div>

              <div>
                <label className="font-medium text-zinc-300 block mb-1">
                  Extra Semester Tuition & Living Cost: ${semesterTuitionCost.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={semesterTuitionCost}
                  onChange={(e) => setSemesterTuitionCost(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Cost of having to enroll for an additional semester later
                </span>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Gross Monthly</span>
                <span className="font-code text-base font-bold text-zinc-100">
                  ${monthlyGross.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Pre-tax baseline</span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Est. Taxes & FICA</span>
                <span className="font-code text-base font-bold text-rose-300">
                  -${estimatedTaxDeduction.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">~22% tax deduction</span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Net Monthly In-Pocket</span>
                <span className="font-code text-base font-bold text-emerald-300">
                  ${netTakeHome.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">After transit & tax</span>
              </div>

              <div className={`p-3.5 rounded-lg border text-center ${
                trueNetFinancialGain > 0 ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
              }`}>
                <span className="text-[11px] text-zinc-400 block mb-0.5">6-Mo Net minus Delay</span>
                <span className={`font-code text-base font-bold ${
                  trueNetFinancialGain > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {trueNetFinancialGain > 0 ? '+' : ''}${trueNetFinancialGain.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">True economic yield</span>
              </div>
            </div>
          </div>

          {/* Market Percentiles & Traps from AI */}
          {marketData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Percentile Distribution */}
              <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200 uppercase font-code">
                    Regional Hourly Percentiles
                  </span>
                  <span className="text-zinc-500 font-code text-[11px]">TECH BENCHMARK</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">25th Percentile (Entry / Small Firm)</span>
                    <span className="font-code text-zinc-200">{marketData.stipendBenchmark.p25Hourly}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-500/30">
                    <span className="text-amber-300 font-medium">50th Percentile (Market Median)</span>
                    <span className="font-code text-amber-200 font-bold">{marketData.stipendBenchmark.p50Hourly}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">75th Percentile (High-Growth Tech)</span>
                    <span className="font-code text-zinc-200">{marketData.stipendBenchmark.p75Hourly}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400">90th Percentile (Top Tier / Co-op)</span>
                    <span className="font-code text-zinc-200">{marketData.stipendBenchmark.p90Hourly}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-zinc-950 text-[11px] text-zinc-400 leading-relaxed">
                  <strong className="text-zinc-300">Living Cost Context: </strong>
                  {marketData.stipendBenchmark.livingCostFactor}
                </div>
              </div>

              {/* Hidden Financial Traps */}
              <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs text-rose-400 font-code">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>CRITICAL FINANCIAL BLIND SPOTS</span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {marketData.stipendBenchmark.hiddenFinancialTraps.map((trap, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-zinc-300 leading-relaxed"
                    >
                      <span className="text-rose-400 font-code text-xs font-bold mt-0.5">
                        0{idx + 1}
                      </span>
                      <span>{trap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: COMPARATIVE OPPORTUNITY MATRIX */}
      {activeSubSection === 'matrix' && (
        <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-code text-purple-400">
                <Scale className="w-3.5 h-3.5" />
                <span>DECISION TRADE-OFF MATRIX</span>
              </div>
              <h3 className="font-serif-display text-xl text-zinc-100 mt-0.5">
                Current Offer vs Benchmark Archetypes
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500 font-code hidden sm:inline">
              HOLISTIC MULTI-CRITERIA EVALUATION
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-code text-zinc-400 uppercase">
                  <th className="py-3 px-3">Criteria</th>
                  <th className="py-3 px-3 text-amber-300 bg-amber-950/20">Your Current Leaning</th>
                  <th className="py-3 px-3">On-Campus Lab / Part-Time</th>
                  <th className="py-3 px-3">Seed Startup (First Hire)</th>
                  <th className="py-3 px-3">Standard Corporate Co-op</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-400">Stipend / Cash</td>
                  <td className="py-3 px-3 bg-amber-950/10 font-code font-bold text-amber-300">
                    ${hourlyRate}/hr (~$5,600/mo)
                  </td>
                  <td className="py-3 px-3 font-code">$18 - $25/hr</td>
                  <td className="py-3 px-3 font-code">$25 - $35/hr + 1% equity</td>
                  <td className="py-3 px-3 font-code">$35 - $45/hr</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-400">Commute Burden</td>
                  <td className="py-3 px-3 bg-amber-950/10 text-emerald-400 font-medium">
                    15m drive (Very Low)
                  </td>
                  <td className="py-3 px-3">0m (Already on campus)</td>
                  <td className="py-3 px-3">45m downtown / unpredictable</td>
                  <td className="py-3 px-3">30-45m suburban campus</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-400">Academic Disruption</td>
                  <td className="py-3 px-3 bg-amber-950/10 text-rose-400 font-medium">
                    High (Overlaps 16-credit Spring)
                  </td>
                  <td className="py-3 px-3 text-emerald-400">None (Designed for students)</td>
                  <td className="py-3 px-3 text-rose-400">Severe (60+ hr weeks)</td>
                  <td className="py-3 px-3 text-amber-300">Moderate (Formal co-op credit)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-400">Structured Mentorship</td>
                  <td className="py-3 px-3 bg-amber-950/10 text-amber-300">
                    Unverified / Likely Ad-hoc
                  </td>
                  <td className="py-3 px-3 text-emerald-400">Direct Professor / PhD guidance</td>
                  <td className="py-3 px-3 text-rose-400">Zero (Trial by fire)</td>
                  <td className="py-3 px-3 text-emerald-400">Dedicated senior mentor</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-400">Long-term Resume Punch</td>
                  <td className="py-3 px-3 bg-amber-950/10">
                    Solid Regional QA/Backend proof
                  </td>
                  <td className="py-3 px-3">Publication / Academic prestige</td>
                  <td className="py-3 px-3 text-amber-300">High variance (Hero or Burnout)</td>
                  <td className="py-3 px-3 text-emerald-400">Tier-1 Brand Signal</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span className="italic">
              Insight: Notice how high cash and short commute conceal academic delay risk.
            </span>
            {onAttachToNotes && (
              <button
                type="button"
                onClick={() =>
                  onAttachToNotes(
                    `• Opportunity Audit: Compared $${hourlyRate}/hr offer against on-campus lab and corporate co-op benchmarks. Academic delay remains core vulnerability.`
                  )
                }
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Save Matrix Takeaway to Notes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
