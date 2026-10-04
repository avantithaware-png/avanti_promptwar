export interface ContextDetails {
  domainOrRole?: string;
  timeframe?: string;
  financials?: string;
  workloadOrHours?: string;
  locationOrCommute?: string;
  academicOrCareerSchedule?: string;
  otherConstraints?: string;
}

export interface HiddenAssumption {
  id: string;
  assumption: string;
  vulnerability: string;
  stressTestQuestion: string;
  fragilityLevel: 'High' | 'Medium' | 'Low' | string;
}

export interface OverlookedConsequence {
  title: string;
  timeHorizon: string;
  explanation: string;
  opportunityCost: string;
}

export interface ReasoningTension {
  biasOrTension: string;
  diagnosis: string;
  correctiveThought: string;
}

export interface CriticalMissingInfo {
  unknownFact: string;
  whyItMatters: string;
  howToFindOut: string;
}

export interface SocraticInquiry {
  id: string;
  question: string;
  intent: string;
}

export interface ExecutiveMirror {
  mentalModelSummary: string;
  overweightedFactors: string[];
  underweightedFactors: string[];
}

export interface BlindSpotAnalysis {
  executiveMirror: ExecutiveMirror;
  hiddenAssumptions: HiddenAssumption[];
  overlookedConsequences: OverlookedConsequence[];
  reasoningTensions: ReasoningTension[];
  criticalMissingInfo: CriticalMissingInfo[];
  socraticInquiries: SocraticInquiry[];
}

export interface AssumptionStressTestResult {
  inversionTest: string;
  fragilityIndicators: string[];
  safeguards: string[];
  realityCheckQuestion: string;
}

export interface FailureCascade {
  scenarioName: string;
  narrative: string;
  rootBlindSpot: string;
  tippingPoint: string;
  preventativeTripwire: string;
}

export interface PremortemResult {
  failureCascades: FailureCascade[];
  synthesisTakeaway: string;
}

export interface SocraticReflectionResult {
  reflectionDepth: string;
  assessment: string;
  newlySurfacedBelief: string;
  followUpInquiry: string;
}

export interface AlternativeOption {
  title: string;
  mechanism: string;
  benefitRetained: string;
  blindSpotMitigated: string;
  negotiationScript: string;
}

export interface StakeholderPerspective {
  role: string;
  lensTitle: string;
  coreWorryOrInsight: string;
  uncomfortableQuestion: string;
}

export interface DecisionRecord {
  id: string;
  timestamp: number;
  title: string;
  currentLeaning: string;
  preConfidence: number;
  postConfidence?: number;
  primaryReasons: string;
  contextDetails: ContextDetails;
  alreadyConsidered: string;
  analysis?: BlindSpotAnalysis;
  userNotes?: string;
  investigatedInfoIds?: string[];
  completedReflections?: Record<string, { userText: string; feedback: SocraticReflectionResult }>;
}
