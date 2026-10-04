import React, { useState } from 'react';
import { BlindSpotAnalysis, ContextDetails } from '../types/decision';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, Copy, Check, Gauge, FileDown } from 'lucide-react';
import { ConfidenceGauge } from './ConfidenceGauge';
import { generateDecisionAuditPdf } from '../utils/generatePdf';

interface DecisionAuditBriefProps {
  decisionTitle: string;
  currentLeaning: string;
  preConfidence: number;
  postConfidence: number;
  primaryReasons: string;
  contextDetails: ContextDetails;
  analysis: BlindSpotAnalysis;
  investigatedIndices: number[];
  userNotes: string;
  onUpdateNotes: (notes: string) => void;
}

export const DecisionAuditBrief: React.FC<DecisionAuditBriefProps> = ({
  decisionTitle,
  currentLeaning,
  preConfidence,
  postConfidence,
  primaryReasons,
  contextDetails,
  analysis,
  investigatedIndices,
  userNotes,
  onUpdateNotes,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const delta = postConfidence - preConfidence;

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      generateDecisionAuditPdf({
        decisionTitle,
        currentLeaning,
        preConfidence,
        postConfidence,
        primaryReasons,
        contextDetails,
        analysis,
        investigatedIndices,
        userNotes,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateMarkdown = () => {
    return `# DECISION REASONING AUDIT
Generated via Aperture — Critical Decision Blind Spot Studio

## 1. Decision Under Consideration
**Topic:** ${decisionTitle}
**Initial Stance:** ${currentLeaning}
**Confidence Calibration:** Initial: ${preConfidence}% | Calibrated Post-Audit: ${postConfidence}% (Delta: ${delta > 0 ? '+' : ''}${delta}%)

**Visible Salient Factors (Stated Reasons):**
${primaryReasons}

## 2. Key Constraints & Context
${Object.entries(contextDetails)
  .filter(([_, v]) => Boolean(v))
  .map(([k, v]) => `- **${k}:** ${v}`)
  .join('\n')}

## 3. Executive Mirror (Mental Model Diagnosis)
${analysis.executiveMirror.mentalModelSummary}

### Over-weighted Visible Factors:
${analysis.executiveMirror.overweightedFactors.map((f) => `- ${f}`).join('\n')}

### Under-weighted Quiet Factors:
${analysis.executiveMirror.underweightedFactors.map((f) => `- ${f}`).join('\n')}

## 4. Unstated & Fragile Assumptions
${analysis.hiddenAssumptions
  .map(
    (a, i) =>
      `### Assumption #${i + 1}: ${a.assumption} (${a.fragilityLevel} Fragility)
- **Vulnerability:** ${a.vulnerability}
- **Stress-Test Query:** ${a.stressTestQuestion}`
  )
  .join('\n\n')}

## 5. Overlooked 2nd & 3rd-Order Consequences
${analysis.overlookedConsequences
  .map(
    (c) =>
      `### ${c.title} (${c.timeHorizon})
${c.explanation}
- **Foreclosed Opportunity Cost:** ${c.opportunityCost}`
  )
  .join('\n\n')}

## 6. Due Diligence Factual Inquiries
${analysis.criticalMissingInfo
  .map(
    (info, idx) =>
      `- [${investigatedIndices.includes(idx) ? 'X' : ' '}] **${info.unknownFact}**
  - Why it matters: ${info.whyItMatters}
  - How to verify: ${info.howToFindOut}`
  )
  .join('\n')}

## 7. Decider Reflection Notes
${userNotes || 'No notes recorded yet.'}

---
*Non-Decider Certification: This audit is a tool for critical reasoning and cognitive de-biasing. Final agency, responsibility, and judgment rest solely with the decision maker.*
`;
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-audit-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="p-5 rounded-xl bg-[#12151c] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl text-zinc-100">
            Decision Reasoning Audit Brief
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            A comprehensive, neutral record of visible anchors, unstated assumptions, and verified due diligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Dossier'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* The Printable Paper Canvas */}
      <div className="p-8 rounded-xl bg-[#0f1117] border border-zinc-800 shadow-xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-zinc-800 pb-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-code text-amber-400">APERTURE / COGNITIVE AUDIT REPORT</span>
            <span>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
          <h1 className="font-serif-display text-3xl text-zinc-100 font-normal">
            {decisionTitle}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
            <span>Stance: <strong className="text-zinc-200">{currentLeaning}</strong></span>
            <span>·</span>
            <span>Due Diligence: <strong className="text-emerald-400">{investigatedIndices.length}/{analysis.criticalMissingInfo.length} Items Investigated</strong></span>
            <span>·</span>
            <span>Confidence Delta: <strong className="text-amber-400">{preConfidence}% → {postConfidence}% ({delta > 0 ? '+' : ''}{delta}%)</strong></span>
          </div>
        </div>

        {/* Confidence Calibration Block */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-amber-400 tracking-wider font-code flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            <span>Confidence Calibration Audit</span>
          </h3>
          <ConfidenceGauge
            preConfidence={preConfidence}
            postConfidence={postConfidence}
            readOnly={true}
          />
        </div>

        {/* 1. Visible Anchors vs Submerged Factors */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-amber-400 tracking-wider font-code">
            01. Salience Imbalance (Visible vs Submerged)
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
            "{analysis.executiveMirror.mentalModelSummary}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-zinc-900/40 border border-zinc-800">
              <span className="font-medium text-amber-300 block mb-1">Visible Drivers:</span>
              <ul className="space-y-1 text-zinc-300">
                {analysis.executiveMirror.overweightedFactors.map((f, i) => (
                  <li key={i}>· {f}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded bg-zinc-900/40 border border-zinc-800">
              <span className="font-medium text-cyan-300 block mb-1">Submerged Factors:</span>
              <ul className="space-y-1 text-zinc-300">
                {analysis.executiveMirror.underweightedFactors.map((f, i) => (
                  <li key={i}>· {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Unstated Assumptions */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <h3 className="text-xs font-semibold uppercase text-amber-400 tracking-wider font-code">
            02. Fragile Assumptions Under Investigation
          </h3>
          <div className="space-y-2.5">
            {analysis.hiddenAssumptions.map((a, i) => (
              <div key={i} className="p-3 rounded bg-zinc-900/40 border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200">Assumption #{i + 1}: "{a.assumption}"</span>
                  <span className="font-code text-[11px] text-amber-400">{a.fragilityLevel} Fragility</span>
                </div>
                <div className="text-zinc-400">
                  <strong className="text-zinc-300">Vulnerability: </strong>
                  {a.vulnerability}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Due Diligence Status */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <h3 className="text-xs font-semibold uppercase text-amber-400 tracking-wider font-code">
            03. Due Diligence Verification Checklist
          </h3>
          <div className="space-y-1.5 text-xs">
            {analysis.criticalMissingInfo.map((info, idx) => {
              const done = investigatedIndices.includes(idx);
              return (
                <div key={idx} className="flex items-start gap-2 text-zinc-300">
                  <span className={done ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                    {done ? '[✓]' : '[ ]'}
                  </span>
                  <div>
                    <span className={done ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                      {info.unknownFact}
                    </span>
                    <span className="text-zinc-500 text-[11px] block">
                      Verify via: {info.howToFindOut}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Decider Notes */}
        <div className="space-y-2 pt-3 border-t border-zinc-800">
          <h3 className="text-xs font-semibold uppercase text-amber-400 tracking-wider font-code">
            04. Your Personal Synthesis & Reasoning Notes
          </h3>
          <textarea
            rows={4}
            value={userNotes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Record your evolving thoughts, personal non-negotiables, or conversations you plan to have before deciding..."
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 leading-relaxed print:hidden"
          />
          {userNotes && (
            <div className="hidden print:block text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
              {userNotes}
            </div>
          )}
        </div>

        {/* Non-Decider Certification Banner */}
        <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-200 block mb-0.5">Non-Prescriptive Assurance:</strong>
            This reasoning audit is created to elevate critical discernment, eliminate unexamined assumptions, and protect against premature closure. It does not dictate an outcome; judgment remains with you.
          </div>
        </div>
      </div>
    </div>
  );
};
