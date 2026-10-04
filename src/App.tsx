import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DecisionInputForm } from './components/DecisionInputForm';
import { SalienceBalanceBar } from './components/SalienceBalanceBar';
import { AssumptionsSection } from './components/AssumptionsSection';
import { ConsequencesSection } from './components/ConsequencesSection';
import { ReasoningTensionsSection } from './components/ReasoningTensionsSection';
import { MissingInfoSection } from './components/MissingInfoSection';
import { SocraticSection } from './components/SocraticSection';
import { PremortemLab } from './components/PremortemLab';
import { AlternativesLab } from './components/AlternativesLab';
import { PerspectiveCrucible } from './components/PerspectiveCrucible';
import { DecisionAuditBrief } from './components/DecisionAuditBrief';
import { ConfidenceGauge } from './components/ConfidenceGauge';
import { OpportunityIntelligenceHub } from './components/OpportunityIntelligenceHub';
import { NegotiationPlaybook } from './components/NegotiationPlaybook';
import { ReversibilityIndex } from './components/ReversibilityIndex';
import { SocraticChatbot } from './components/SocraticChatbot';
import { generateDecisionAuditPdf } from './utils/generatePdf';
import { BlindSpotAnalysis, ContextDetails, DecisionRecord } from './types/decision';
import {
  Compass,
  Layers,
  Skull,
  GitFork,
  Users,
  FileText,
  RotateCcw,
  Sparkles,
  AlertCircle,
  TrendingUp,
  History,
  Trash2,
  Gauge,
  MapPin,
  Briefcase,
  Handshake,
  ArrowLeftRight,
  MessageSquare,
  Bot,
  FileDown,
} from 'lucide-react';

const STORAGE_KEY = 'aperture_saved_decisions_v1';

export default function App() {
  const [activeDecision, setActiveDecision] = useState<{
    title: string;
    currentLeaning: string;
    preConfidence: number;
    postConfidence: number;
    primaryReasons: string;
    contextDetails: ContextDetails;
    alreadyConsidered: string;
  } | null>(null);

  const [analysis, setAnalysis] = useState<BlindSpotAnalysis | null>(null);
  const [investigatedIndices, setInvestigatedIndices] = useState<number[]>([]);
  const [userNotes, setUserNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'diagnosis' | 'premortem' | 'alternatives' | 'perspectives' | 'locations' | 'negotiate' | 'reversibility' | 'audit'
  >('diagnosis');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedHistory, setSavedHistory] = useState<DecisionRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save active record to history when analysis updates
  const saveToHistory = (
    title: string,
    currentLeaning: string,
    preConfidence: number,
    postConfidence: number,
    primaryReasons: string,
    contextDetails: ContextDetails,
    alreadyConsidered: string,
    analysisData: BlindSpotAnalysis
  ) => {
    try {
      const record: DecisionRecord = {
        id: `dec_${Date.now()}`,
        timestamp: Date.now(),
        title,
        currentLeaning,
        preConfidence,
        postConfidence,
        primaryReasons,
        contextDetails,
        alreadyConsidered,
        analysis: analysisData,
        investigatedInfoIds: [],
        userNotes: '',
      };
      const updated = [record, ...savedHistory.filter((item) => item.title !== title)].slice(
        0,
        15
      );
      setSavedHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to history', e);
    }
  };

  const handleRunAnalysis = async (formData: {
    decisionTitle: string;
    currentLeaning: string;
    preConfidence: number;
    primaryReasons: string;
    contextDetails: ContextDetails;
    alreadyConsidered: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveDecision({
      title: formData.decisionTitle,
      currentLeaning: formData.currentLeaning,
      preConfidence: formData.preConfidence,
      postConfidence: formData.preConfidence,
      primaryReasons: formData.primaryReasons,
      contextDetails: formData.contextDetails,
      alreadyConsidered: formData.alreadyConsidered,
    });
    setInvestigatedIndices([]);
    setUserNotes('');
    setActiveTab('diagnosis');

    try {
      const res = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to complete blind spot analysis.');
      }

      const data: BlindSpotAnalysis = await res.json();
      setAnalysis(data);
      saveToHistory(
        formData.decisionTitle,
        formData.currentLeaning,
        formData.preConfidence,
        formData.preConfidence,
        formData.primaryReasons,
        formData.contextDetails,
        formData.alreadyConsidered,
        data
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while connecting to the diagnostic server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleInvestigated = (index: number) => {
    setInvestigatedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleLoadFromHistory = (item: DecisionRecord) => {
    setActiveDecision({
      title: item.title,
      currentLeaning: item.currentLeaning,
      preConfidence: item.preConfidence || 75,
      postConfidence: item.postConfidence ?? (item.preConfidence || 75),
      primaryReasons: item.primaryReasons,
      contextDetails: item.contextDetails,
      alreadyConsidered: item.alreadyConsidered,
    });
    if (item.analysis) {
      setAnalysis(item.analysis);
    }
    setInvestigatedIndices(
      item.investigatedInfoIds
        ? item.investigatedInfoIds.map((id) => parseInt(id, 10)).filter((n) => !isNaN(n))
        : []
    );
    setUserNotes(item.userNotes || '');
    setActiveTab('diagnosis');
    setShowHistoryModal(false);
  };

  const handleClearHistory = () => {
    setSavedHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleNewDecision = () => {
    setActiveDecision(null);
    setAnalysis(null);
    setErrorMessage(null);
    setInvestigatedIndices([]);
    setUserNotes('');
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex flex-col font-sans-body">
      <Header
        onNewDecision={handleNewDecision}
        hasActiveAnalysis={Boolean(analysis)}
      />

      <main className="flex-1">
        {/* If no analysis yet, show blueprint intake form */}
        {!analysis && (
          <div>
            <DecisionInputForm onSubmit={handleRunAnalysis} isLoading={isLoading} />
            {errorMessage && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Diagnostic Engine Notice:</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick history link if available */}
            {savedHistory.length > 0 && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 flex justify-center">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs text-zinc-400 hover:text-amber-300 font-medium flex items-center gap-1.5 py-1 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Previous Decisions ({savedHistory.length})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* If analysis loaded, show interactive workspace */}
        {analysis && activeDecision && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Decision Dossier Header */}
            <div className="p-6 rounded-xl bg-[#12151c] border border-zinc-800/90 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-code">
                    <span>ACTIVE AUDIT</span>
                    <span aria-hidden="true">·</span>
                    <span>STANCE: {activeDecision.currentLeaning.toUpperCase()}</span>
                  </div>
                  <h1 className="font-serif-display text-2xl sm:text-3xl text-zinc-100 font-medium">
                    {activeDecision.title}
                  </h1>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    <strong className="text-zinc-300">Visible Drivers: </strong>
                    {activeDecision.primaryReasons}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      if (activeDecision && analysis) {
                        generateDecisionAuditPdf({
                          decisionTitle: activeDecision.title,
                          currentLeaning: activeDecision.currentLeaning,
                          preConfidence: activeDecision.preConfidence,
                          postConfidence: activeDecision.postConfidence,
                          primaryReasons: activeDecision.primaryReasons,
                          contextDetails: activeDecision.contextDetails,
                          analysis,
                          investigatedIndices,
                          userNotes,
                        });
                      }
                    }}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Download Official PDF Dossier"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 transition-colors cursor-pointer"
                    title="History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNewDecision}
                    className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change Decision</span>
                  </button>
                </div>
              </div>

              {/* Stance Evolution Tracker */}
              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Has your stance shifted after examining these factors?</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Still Leaning Yes',
                    'Paused / Seeking Due Diligence',
                    'More Skeptical Now',
                    'Exploring Third Options',
                  ].map((stance) => (
                    <button
                      key={stance}
                      onClick={() =>
                        setActiveDecision((prev) =>
                          prev ? { ...prev, currentLeaning: stance } : prev
                        )
                      }
                      className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                        activeDecision.currentLeaning === stance
                          ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-medium'
                          : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {stance}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confidence Calibration Gauge (Before vs After Analysis) */}
            <ConfidenceGauge
              preConfidence={activeDecision.preConfidence}
              postConfidence={activeDecision.postConfidence}
              onChangePostConfidence={(val) => {
                setActiveDecision((prev) =>
                  prev ? { ...prev, postConfidence: val } : prev
                );
                setSavedHistory((prev) =>
                  prev.map((rec) =>
                    rec.title === activeDecision.title
                      ? { ...rec, postConfidence: val }
                      : rec
                  )
                );
              }}
            />

            {/* Navigation Workbench Tabs (Functional Segmented Buttons, allowed per anti-slop rules) */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/70 border border-zinc-800/90 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('diagnosis')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'diagnosis'
                    ? 'bg-[#181c25] text-amber-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>1. Blind Spot Diagnosis</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('premortem')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'premortem'
                    ? 'bg-[#181c25] text-rose-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Skull className="w-3.5 h-3.5" />
                <span>2. Pre-Mortem Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('alternatives')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'alternatives'
                    ? 'bg-[#181c25] text-cyan-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>3. The Third Way (Alternatives)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('perspectives')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'perspectives'
                    ? 'bg-[#181c25] text-purple-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>4. Perspective Crucible</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('locations')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'locations'
                    ? 'bg-[#181c25] text-amber-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>5. Locations & Stipend Hub</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('negotiate')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'negotiate'
                    ? 'bg-[#181c25] text-emerald-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>6. Negotiation Playbook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reversibility')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'reversibility'
                    ? 'bg-[#181c25] text-cyan-300 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>7. Reversibility Index</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-[#181c25] text-amber-400 shadow-sm border border-zinc-700/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>8. Decision Audit Brief</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'diagnosis' && (
              <div className="space-y-6 animate-fade-in">
                {/* Salience Contrast Bar */}
                <SalienceBalanceBar executiveMirror={analysis.executiveMirror} />

                {/* 01. Unstated & Fragile Assumptions */}
                <AssumptionsSection
                  assumptions={analysis.hiddenAssumptions}
                  decisionTitle={activeDecision.title}
                />

                {/* 02. Overlooked Consequences */}
                <ConsequencesSection
                  consequences={analysis.overlookedConsequences}
                />

                {/* 03. Reasoning Tensions & Cognitive Biases */}
                <ReasoningTensionsSection
                  tensions={analysis.reasoningTensions}
                />

                {/* 04. Critical Missing Info & Verification Checklist */}
                <MissingInfoSection
                  missingInfo={analysis.criticalMissingInfo}
                  investigatedIndices={investigatedIndices}
                  onToggleInvestigated={handleToggleInvestigated}
                />

                {/* 05. Socratic Probing Dialogue */}
                <SocraticSection
                  inquiries={analysis.socraticInquiries}
                  decisionTitle={activeDecision.title}
                />
              </div>
            )}

            {activeTab === 'premortem' && (
              <PremortemLab
                decisionTitle={activeDecision.title}
                primaryReasons={activeDecision.primaryReasons}
                contextDetails={activeDecision.contextDetails}
              />
            )}

            {activeTab === 'alternatives' && (
              <AlternativesLab
                decisionTitle={activeDecision.title}
                primaryReasons={activeDecision.primaryReasons}
                contextDetails={activeDecision.contextDetails}
              />
            )}

            {activeTab === 'perspectives' && (
              <PerspectiveCrucible
                decisionTitle={activeDecision.title}
                primaryReasons={activeDecision.primaryReasons}
                contextDetails={activeDecision.contextDetails}
              />
            )}

            {activeTab === 'locations' && (
              <OpportunityIntelligenceHub
                decisionTitle={activeDecision.title}
                contextDetails={activeDecision.contextDetails}
                onAttachToNotes={(noteText) => {
                  setUserNotes((prev) => (prev ? `${prev}\n${noteText}` : noteText));
                }}
              />
            )}

            {activeTab === 'negotiate' && (
              <NegotiationPlaybook
                decisionTitle={activeDecision.title}
                primaryReasons={activeDecision.primaryReasons}
                contextDetails={activeDecision.contextDetails}
                onAttachToNotes={(noteText) => {
                  setUserNotes((prev) => (prev ? `${prev}\n${noteText}` : noteText));
                }}
              />
            )}

            {activeTab === 'reversibility' && (
              <ReversibilityIndex
                decisionTitle={activeDecision.title}
                contextDetails={activeDecision.contextDetails}
                onAttachToNotes={(noteText) => {
                  setUserNotes((prev) => (prev ? `${prev}\n${noteText}` : noteText));
                }}
              />
            )}

            {activeTab === 'audit' && (
              <DecisionAuditBrief
                decisionTitle={activeDecision.title}
                currentLeaning={activeDecision.currentLeaning}
                preConfidence={activeDecision.preConfidence}
                postConfidence={activeDecision.postConfidence}
                primaryReasons={activeDecision.primaryReasons}
                contextDetails={activeDecision.contextDetails}
                analysis={analysis}
                investigatedIndices={investigatedIndices}
                userNotes={userNotes}
                onUpdateNotes={setUserNotes}
              />
            )}
          </div>
        )}
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12151c] border border-zinc-700/90 rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-100 font-serif-display text-xl">
                <History className="w-5 h-5 text-amber-400" />
                <span>Decision History & Saved Audits</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>

            {savedHistory.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No previous decisions recorded yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {savedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-semibold text-zinc-200 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {item.primaryReasons}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-code">
                        {new Date(item.timestamp).toLocaleDateString()} · Stance: {item.currentLeaning}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadFromHistory(item)}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded text-xs shrink-0 transition-colors"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                onClick={handleClearHistory}
                disabled={savedHistory.length === 0}
                className="text-rose-400 hover:text-rose-300 disabled:opacity-40 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Socratic Chatbot Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-2xl shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer border border-amber-300/40 group backdrop-blur-sm"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-zinc-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-amber-500 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-none">Socratic Mirror</div>
            <div className="text-[10px] font-code opacity-80 leading-none mt-0.5">Gemini 3.5 Chat</div>
          </div>
        </button>
      </div>

      {/* Socratic Multi-turn Chatbot Modal */}
      <SocraticChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        decisionTitle={activeDecision?.title}
        currentLeaning={activeDecision?.currentLeaning}
        primaryReasons={activeDecision?.primaryReasons}
        contextDetails={activeDecision?.contextDetails}
      />

      {/* Quiet Ethical Non-Decider Footer */}
      <footer className="border-t border-zinc-800/80 py-6 mt-12 bg-[#0a0c10] text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-medium text-zinc-400">
            Aperture · Critical Decision Blind Spot Studio
          </p>
          <p className="text-[11px] text-zinc-500">
            Exposing visible salience bias, unstated premises, and latent opportunity costs. Moral agency and decision ownership belong strictly to the human decider.
          </p>
        </div>
      </footer>
    </div>
  );
}
