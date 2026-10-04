import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// Server-side initialization of GoogleGenAI SDK as per gemini-api skill
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const NON_DECIDER_MANDATE = `
CRITICAL CORE PRINCIPLE: You are a Cognitive Mirror and Critical Thinking Catalyst.
You must NEVER tell the user what to decide, say whether they should accept or decline, or push them toward any outcome.
Your purpose is strictly to help the user identify blind spots, unexamined assumptions, invisible trade-offs, internal contradictions, and high-leverage questions they haven't asked.
Maintain an intellectually rigorous, respectful, balanced, and non-prescriptive tone.
`;

// Helper for resilient API calls with exponential backoff for transient 503/429
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      const isTransient =
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED');
      if (isTransient && attempt < maxRetries) {
        console.warn(`Transient API error on attempt ${attempt + 1}, retrying in ${delayMs * (attempt + 1)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

const formatErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred.';
  const msg = typeof error === 'string' ? error : error.message || '';
  if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return 'The AI service is experiencing a momentary spike in demand. Please try again in a few seconds.';
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Rate limit reached on free tier. Please wait a brief moment before submitting your next inquiry.';
  }
  return msg || 'Failed to process request.';
};

// 1. Analyze Decision & Discover Blind Spots
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const {
      decisionTitle,
      currentLeaning,
      primaryReasons,
      contextDetails,
      alreadyConsidered,
    } = req.body;

    if (!decisionTitle || !primaryReasons) {
      return res.status(400).json({
        error: 'Please provide both the decision topic and your primary reasons.',
      });
    }

    const ai = getAIClient();

    const prompt = `
Analyze the user's decision context and surface their cognitive blind spots.

Decision Under Consideration:
"${decisionTitle}"

User's Initial Inclination:
"${currentLeaning || 'Undecided / Open'}"

Primary Stated Reasons & Most Visible Factors (What the user is heavily relying on):
"${primaryReasons}"

Additional Context & Known Constraints:
${JSON.stringify(contextDetails || {}, null, 2)}

What the user feels they have already considered (Do NOT waste time re-explaining these):
"${alreadyConsidered || 'None specified'}"

${NON_DECIDER_MANDATE}

Conduct an exhaustive, deep blind-spot audit covering:
1. Executive Mirror: Restate the user's current mental model non-judgmentally. Highlight the Salience Imbalance (what visible factors they are over-weighting vs what quiet factors are being overlooked).
2. Unstated & Fragile Assumptions: Identify 3 to 5 implicit assumptions the user is making without solid evidence, and explain why each is vulnerable.
3. Overlooked Second- and Third-Order Consequences: Ripples across time (e.g. academic timeline, burnout, opportunity costs, relational capital, long-term options).
4. Internal Reasoning Tensions & Cognitive Biases: Biases at play (e.g. Present Bias, Availability Heuristic, Halo Effect, False Binary) and subtle conflicts within their own stated priorities.
5. Crucial Missing Information: Concrete factual unknowns that should be verified before any final commitment.
6. Socratic Inquiries: 4 to 5 penetrating, non-directive reflection questions designed to expand their perspective.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an elite reasoning analyst and decision diagnostic engine. Your mission is to elevate the user's critical thinking by discovering invisible blind spots and fragile assumptions, strictly without deciding for them. Output valid JSON matching the requested schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveMirror: {
              type: Type.OBJECT,
              properties: {
                mentalModelSummary: {
                  type: Type.STRING,
                  description:
                    'Crisp restatement of the user current mental model and visible drivers.',
                },
                overweightedFactors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'List of visible or tangible factors the user is heavily anchoring on.',
                },
                underweightedFactors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'List of quiet or delayed factors currently receiving insufficient attention.',
                },
              },
              required: [
                'mentalModelSummary',
                'overweightedFactors',
                'underweightedFactors',
              ],
            },
            hiddenAssumptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  assumption: {
                    type: Type.STRING,
                    description: 'The implicit assumption being made.',
                  },
                  vulnerability: {
                    type: Type.STRING,
                    description:
                      'Why this assumption might fail or be overly optimistic.',
                  },
                  stressTestQuestion: {
                    type: Type.STRING,
                    description:
                      'A concrete question to test the validity of this assumption.',
                  },
                  fragilityLevel: {
                    type: Type.STRING,
                    description: 'High, Medium, or Low risk to reasoning.',
                  },
                },
                required: [
                  'id',
                  'assumption',
                  'vulnerability',
                  'stressTestQuestion',
                  'fragilityLevel',
                ],
              },
            },
            overlookedConsequences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  timeHorizon: {
                    type: Type.STRING,
                    description: 'Immediate (1-3mo), Medium (6mo-1yr), Long-term (2-5yr)',
                  },
                  explanation: { type: Type.STRING },
                  opportunityCost: {
                    type: Type.STRING,
                    description:
                      'What alternative potential is quietly foreclosed by this choice.',
                  },
                },
                required: [
                  'title',
                  'timeHorizon',
                  'explanation',
                  'opportunityCost',
                ],
              },
            },
            reasoningTensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  biasOrTension: {
                    type: Type.STRING,
                    description: 'Name of the cognitive bias or conflicting premise.',
                  },
                  diagnosis: {
                    type: Type.STRING,
                    description:
                      'How it manifests in the user specific scenario.',
                  },
                  correctiveThought: {
                    type: Type.STRING,
                    description:
                      'A balancing counter-thought to restore objectivity.',
                  },
                },
                required: ['biasOrTension', 'diagnosis', 'correctiveThought'],
              },
            },
            criticalMissingInfo: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  unknownFact: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  howToFindOut: {
                    type: Type.STRING,
                    description: 'Who to ask or what to investigate.',
                  },
                },
                required: ['unknownFact', 'whyItMatters', 'howToFindOut'],
              },
            },
            socraticInquiries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  intent: {
                    type: Type.STRING,
                    description:
                      'What blind spot or belief this question nudges them to inspect.',
                  },
                },
                required: ['id', 'question', 'intent'],
              },
            },
          },
          required: [
            'executiveMirror',
            'hiddenAssumptions',
            'overlookedConsequences',
            'reasoningTensions',
            'criticalMissingInfo',
            'socraticInquiries',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing decision:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze decision blind spots.',
    });
  }
});

// 2. Stress Test a Specific Assumption
app.post('/api/stress-test-assumption', async (req, res) => {
  try {
    const { decisionTitle, assumption, vulnerability } = req.body;
    if (!assumption) {
      return res.status(400).json({ error: 'Assumption is required.' });
    }

    const ai = getAIClient();
    const prompt = `
Stress-test this specific unstated assumption underlying the user's decision.

Decision: "${decisionTitle}"
Assumption: "${assumption}"
Identified Vulnerability: "${vulnerability || ''}"

${NON_DECIDER_MANDATE}

Provide:
1. "The Inversion Test": What happens if the exact opposite of this assumption turns out to be true?
2. "Fragility Indicators": Early warning signs that this assumption is crumbling during execution.
3. "De-risking Safeguards": Practical ways to hedge or verify before or during the commitment without abandoning agency.
4. "The Reality-Check Question": One sharp question they must answer honestly before relying on this assumption.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a rigorous analytical stress-tester. Return structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inversionTest: { type: Type.STRING },
            fragilityIndicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safeguards: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            realityCheckQuestion: { type: Type.STRING },
          },
          required: [
            'inversionTest',
            'fragilityIndicators',
            'safeguards',
            'realityCheckQuestion',
          ],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in stress-test-assumption:', error);
    return res.status(500).json({
      error: error.message || 'Failed to stress-test assumption.',
    });
  }
});

// 3. Pre-Mortem Simulation ("Look Back from Failure")
app.post('/api/simulate-premortem', async (req, res) => {
  try {
    const { decisionTitle, primaryReasons, contextDetails } = req.body;
    const ai = getAIClient();

    const prompt = `
Conduct a rigorous Pre-Mortem exercise for this decision.
"Imagine you are 6 to 12 months in the future. The decision was made following your initial leaning, and it resulted in severe regret, disappointment, or stalled growth."

Decision: "${decisionTitle}"
Initial Stated Justification: "${primaryReasons}"
Context: ${JSON.stringify(contextDetails || {})}

${NON_DECIDER_MANDATE}

Construct:
1. 3 distinct, highly realistic "Failure Cascades" showing how unaddressed blind spots cascaded into regret.
2. In each cascade, identify:
   - The Root Blind Spot (what was ignored at the start)
   - The Tipping Point (the moment things started unravelling)
   - The Preventative Tripwire (a rule or threshold the decider can establish today to catch this early)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert cognitive pre-mortem facilitator. Return clean JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            failureCascades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scenarioName: { type: Type.STRING },
                  narrative: { type: Type.STRING },
                  rootBlindSpot: { type: Type.STRING },
                  tippingPoint: { type: Type.STRING },
                  preventativeTripwire: { type: Type.STRING },
                },
                required: [
                  'scenarioName',
                  'narrative',
                  'rootBlindSpot',
                  'tippingPoint',
                  'preventativeTripwire',
                ],
              },
            },
            synthesisTakeaway: {
              type: Type.STRING,
              description:
                'Overall guidance on what underlying theme connects these potential pitfalls.',
            },
          },
          required: ['failureCascades', 'synthesisTakeaway'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error simulating pre-mortem:', error);
    return res.status(500).json({
      error: error.message || 'Failed to simulate pre-mortem.',
    });
  }
});

// 4. Interactive Socratic Reflection Dialogue
app.post('/api/socratic-reflect', async (req, res) => {
  try {
    const { decisionTitle, question, userReflection } = req.body;
    if (!question || !userReflection) {
      return res.status(400).json({
        error: 'Both question and your reflection are required.',
      });
    }

    const ai = getAIClient();
    const prompt = `
The user is contemplating the decision: "${decisionTitle}"
They were asked this Socratic probing question:
"${question}"

The user wrote this reflection:
"${userReflection}"

${NON_DECIDER_MANDATE}

Evaluate their reflection critically:
1. Did they genuinely confront the underlying tension, or did they rationalize / bypass it?
2. What new assumption or clarity emerged from their answer?
3. Provide a constructive follow-up nudge or sharpened inquiry to deepen their examination.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a Socratic tutor examining a student or professional reasoning. Never decide for them. Return JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflectionDepth: {
              type: Type.STRING,
              description: 'e.g., Deep & Candid, Partial Confrontation, or Defensive Rationalization',
            },
            assessment: {
              type: Type.STRING,
              description: 'Clear breakdown of what their response achieved and what remained unaddressed.',
            },
            newlySurfacedBelief: {
              type: Type.STRING,
              description: 'A deeper core priority or belief revealed by their reflection.',
            },
            followUpInquiry: {
              type: Type.STRING,
              description: 'A sharp, friendly next question to cement their thinking.',
            },
          },
          required: [
            'reflectionDepth',
            'assessment',
            'newlySurfacedBelief',
            'followUpInquiry',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in socratic reflection:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process reflection.',
    });
  }
});

// 5. Generate Creative Third Alternatives / Reframes
app.post('/api/generate-alternatives', async (req, res) => {
  try {
    const { decisionTitle, primaryReasons, contextDetails } = req.body;
    const ai = getAIClient();

    const prompt = `
Break the false binary in this decision:
"${decisionTitle}"
Stated reasons: "${primaryReasons}"
Context: ${JSON.stringify(contextDetails || {})}

${NON_DECIDER_MANDATE}

Generate 4 creative "Third Way" architectural alternatives or compromises that retain the primary benefits (e.g. learning, earnings, growth) while mitigating the identified blind spots (e.g. academic delay, burnout, lack of clarity).
For example:
- A negotiation lever (scope, hours, remote split, deferral)
- A hybrid structure
- A phased commitment or probation check-in
- A parallel low-risk experiment
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a master strategist who breaks false dichotomies. Return JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  mechanism: { type: Type.STRING },
                  benefitRetained: { type: Type.STRING },
                  blindSpotMitigated: { type: Type.STRING },
                  negotiationScript: {
                    type: Type.STRING,
                    description: 'A phrase or angle to pitch this option.',
                  },
                },
                required: [
                  'title',
                  'mechanism',
                  'benefitRetained',
                  'blindSpotMitigated',
                  'negotiationScript',
                ],
              },
            },
          },
          required: ['alternatives'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating alternatives:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate alternatives.',
    });
  }
});

// 6. Perspective Crucible (View through 4 external lenses)
app.post('/api/perspective-crucible', async (req, res) => {
  try {
    const { decisionTitle, primaryReasons, contextDetails } = req.body;
    const ai = getAIClient();

    const prompt = `
Analyze this decision through 4 external, highly distinct stakeholder perspectives:
1. The Academic or Institutional Guardian (focuses on credentials, prerequisites, burnout, graduation integrity)
2. Your Future Self (5 Years out, looking back at whether this had lasting catalytic value)
3. A Seasoned Domain Veteran / Hiring Executive (evaluates the true signal of this credential vs actual skills)
4. The Constructive Skeptic / Devil's Advocate (ruthlessly identifies what will go wrong if you are being naive)

Decision: "${decisionTitle}"
Primary Reasons: "${primaryReasons}"
Context: ${JSON.stringify(contextDetails || {})}

${NON_DECIDER_MANDATE}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a multi-perspective cognitive simulator. Return JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            perspectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  lensTitle: { type: Type.STRING },
                  coreWorryOrInsight: { type: Type.STRING },
                  uncomfortableQuestion: { type: Type.STRING },
                },
                required: [
                  'role',
                  'lensTitle',
                  'coreWorryOrInsight',
                  'uncomfortableQuestion',
                ],
              },
            },
          },
          required: ['perspectives'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in perspective crucible:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate perspectives.',
    });
  }
});

// 7. Nearby Location Scout & Top 3 Place Recommendations (Powered by Google Maps Grounding)
app.post('/api/nearby-places', async (req, res) => {
  try {
    const { category, customQuery, cityOrArea, latitude, longitude, decisionTitle } = req.body;
    const ai = getAIClient();

    let queryDescription = customQuery || '';
    if (!queryDescription) {
      if (category === 'study_workspaces') {
        queryDescription = 'Find the top 3 best quiet libraries, study spaces, or productive work cafes nearby for deep focus and after-hours studying.';
      } else if (category === 'tech_companies') {
        queryDescription = 'Find the top 3 best tech company offices, software employers, or startup headquarters nearby for internships and industry opportunities.';
      } else if (category === 'coworking_hubs') {
        queryDescription = 'Find the top 3 best co-working spaces or innovation hubs nearby with high-speed internet and flexible access.';
      } else if (category === 'commute_transit') {
        queryDescription = 'Find the top 3 main transit hubs, park-and-rides, or commuter transport stations nearby.';
      } else {
        queryDescription = 'Find and suggest the top 3 best relevant nearby locations for this decision context.';
      }
    }

    let locationContext = '';
    if (cityOrArea) {
      locationContext = `in or near ${cityOrArea}`;
    }

    const prompt = `
You are helping a decider audit geographic and logistical factors for their decision:
"${decisionTitle || 'Evaluating logistical and spatial trade-offs'}"

Goal: ${queryDescription} ${locationContext}

Please find and recommend the top 3 best specific places that fit this criteria.
For EACH of the top 3 places, provide:
1. Exact Name of the place
2. Why it is ranked in the top 3 and how it serves this decision (e.g. noise level, hours, commute convenience, company prestige, networking)
3. Key logistical detail (neighborhood / general location, public transit proximity or parking availability)
4. A critical blind-spot consideration for this location (e.g. peak hour crowding, fees, membership requirements, commute bottleneck)

Conclude with a brief 1-sentence tip on how visiting or testing this location beforehand prevents blind spots.
Format cleanly with Markdown with clear bold place names.
`;

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }

    let response;
    let text = '';
    let groundingChunks: any[] = [];
    const places: Array<{
      title: string;
      uri: string;
      reviewSnippets?: string[];
    }> = [];

    try {
      response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config,
        })
      );

      text = response.text || '';
      groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      // Extract place links and reviews per Maps Grounding guidelines
      for (const chunk of groundingChunks) {
        if ((chunk as any).maps?.uri) {
          places.push({
            title: (chunk as any).maps.title || 'View Location on Google Maps',
            uri: (chunk as any).maps.uri,
            reviewSnippets: (chunk as any).maps.placeAnswerSources?.reviewSnippets || [],
          });
        }
      }
    } catch (apiError: any) {
      console.warn('Maps grounding hit an error or quota limit, falling back gracefully:', apiError.message);
      // Fallback request to generate recommendations with constructed Google Maps URLs
      const fallbackResponse = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${prompt}\n(Note: Provide 3 specific, real-world existing place names with their neighborhood and street where known)`,
        })
      );
      text = fallbackResponse.text || '';

      // Extract top 3 place names from markdown bold lines or numbered lists
      const placeMatches = text.match(/(?:^|\n)(?:[0-9]+\.|\*\*Rank [0-9]+:?\*\*|\*\*)\s*([A-Z0-9][^\n:*]+?)(?:\*\*|:|\n)/g);
      if (placeMatches) {
        for (const match of placeMatches.slice(0, 3)) {
          const cleanName = match.replace(/^[0-9.]+\s*|\*\*|:|\n/g, '').trim();
          if (cleanName.length > 2 && !cleanName.toLowerCase().includes('rank')) {
            places.push({
              title: cleanName,
              uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + (cityOrArea ? ` ${cityOrArea}` : ''))}`,
            });
          }
        }
      }
    }

    return res.json({
      text,
      places,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Error fetching nearby places:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// 8. Job & Internship Opportunities & Stipend Market Intelligence
app.post('/api/opportunity-intelligence', async (req, res) => {
  try {
    const { roleOrDomain, locationOrCity, currentFinancials, decisionTitle } = req.body;
    const ai = getAIClient();

    const prompt = `
You are an expert career intelligence and compensation analyst providing objective market data.
Decision Topic: "${decisionTitle || 'Career / Internship Decision'}"
Role or Domain: "${roleOrDomain || 'Software & Tech'}"
Target Location or Region: "${locationOrCity || 'General Tech Hub'}"
Stated Financials / Stipend: "${currentFinancials || 'Not specified'}"

${NON_DECIDER_MANDATE}

Generate a structured market intelligence report containing real-world job opportunity archetypes, realistic compensation benchmarks, and financial blind spots.
`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a rigorous compensation and job market analyst. Deliver realistic numbers, unvarnished trade-offs, and critical financial warnings. Return valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jobOpportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    companyType: { type: Type.STRING },
                    typicalRole: { type: Type.STRING },
                    expectedStipendRange: { type: Type.STRING },
                    pros: { type: Type.STRING },
                    hiddenCons: { type: Type.STRING },
                    hiringCriteria: { type: Type.STRING },
                  },
                  required: [
                    'companyType',
                    'typicalRole',
                    'expectedStipendRange',
                    'pros',
                    'hiddenCons',
                    'hiringCriteria',
                  ],
                },
              },
              stipendBenchmark: {
                type: Type.OBJECT,
                properties: {
                  medianHourlyRate: { type: Type.STRING },
                  p25Hourly: { type: Type.STRING },
                  p50Hourly: { type: Type.STRING },
                  p75Hourly: { type: Type.STRING },
                  p90Hourly: { type: Type.STRING },
                  estimatedMonthlyGross: { type: Type.STRING },
                  estimatedNetTakeHomePercent: { type: Type.STRING },
                  hiddenFinancialTraps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  livingCostFactor: { type: Type.STRING },
                },
                required: [
                  'medianHourlyRate',
                  'p25Hourly',
                  'p50Hourly',
                  'p75Hourly',
                  'p90Hourly',
                  'estimatedMonthlyGross',
                  'estimatedNetTakeHomePercent',
                  'hiddenFinancialTraps',
                  'livingCostFactor',
                ],
              },
              opportunitySynthesis: {
                type: Type.OBJECT,
                properties: {
                  marketClarityNote: { type: Type.STRING },
                  negotiationLever: { type: Type.STRING },
                },
                required: ['marketClarityNote', 'negotiationLever'],
              },
            },
            required: [
              'jobOpportunities',
              'stipendBenchmark',
              'opportunitySynthesis',
            ],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating opportunity intelligence:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// 9. Multi-Turn Gemini Decision & Socratic Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, decisionContext, roleMode } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getAIClient();

    let systemInstruction = `
You are the "Socratic Mirror", an intellectual reasoning sparring partner embedded within Aperture Decision Lab.
${NON_DECIDER_MANDATE}

Your purpose is to converse with the user in multi-turn dialogue, challenging their hidden rationalizations, probing assumptions, playing constructive devil's advocate, and helping them dissect high-stakes dilemmas.

Active Decision Context:
- Topic: "${decisionContext?.decisionTitle || 'General Decision & Opportunity Analysis'}"
- Current Leaning: "${decisionContext?.currentLeaning || 'Undecided'}"
- Key Reasons: "${decisionContext?.primaryReasons || 'None stated'}"
- Known Details: Domain: ${decisionContext?.contextDetails?.domainOrRole || 'N/A'}, Location/Commute: ${decisionContext?.contextDetails?.locationOrCommute || 'N/A'}, Financials: ${decisionContext?.contextDetails?.financials || 'N/A'}
`;

    if (roleMode === 'devils_advocate') {
      systemInstruction += `
Role Persona: Constructive Devil's Advocate. Your job is to poke holes respectfully, test worst-case interpretations, and ensure the user isn't wearing rose-colored glasses.
`;
    } else if (roleMode === 'negotiation_coach') {
      systemInstruction += `
Role Persona: Negotiation & Strategy Coach. Your job is to help the user identify hidden leverage, practice saying no to bad terms, and craft win-win counter-proposals (e.g., 32-hr week, academic co-op credit).
`;
    } else {
      systemInstruction += `
Role Persona: Socratic Interrogator. Ask concise, sharp, high-leverage questions. Never preach or give lectures. Keep your responses thoughtful, engaging, and usually under 150 words.
`;
    }

    // Convert messages to Gemini API format
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })
    );

    const replyText = response.text || "I'm reflecting on your thought. Could you elaborate on what you feel most uncertain about?";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// 10. Negotiation & Counter-Proposal Playbook
app.post('/api/negotiation-playbook', async (req, res) => {
  try {
    const { decisionTitle, primaryReasons, contextDetails } = req.body;
    const ai = getAIClient();

    const prompt = `
The user is facing this decision/offer:
Decision: "${decisionTitle}"
Reasons & Motivation: "${primaryReasons}"
Context Details: ${JSON.stringify(contextDetails || {})}

${NON_DECIDER_MANDATE}

Many people believe they must accept an offer as-is or walk away. Generate 3 specific, actionable negotiation and compromise counter-proposals that eliminate their biggest blind spots (e.g. keeping coursework intact, flexible hybrid schedule, higher stipend to offset delayed graduation).

For each strategy:
1. title: Name of the strategy (e.g., "The Academic Prerequisite Shield (32-hr Cap)")
2. goal: What specific downside or blind spot this solves
3. emailScript: Complete, polite, highly professional email template ready to send to the employer/manager
4. verbalPitch: Short 2-sentence script for a phone/in-person conversation
5. anticipatedPushback: What the company might say (e.g., "Our team standard is 40 on-site hours")
6. counterResponse: Exactly how to respond to that pushback without losing the offer
7. feasibilityScore: A percentage rating (e.g. "85% Likelihood of Acceptance")
`;

    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an elite career negotiation and compromise architect. Return valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strategies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    goal: { type: Type.STRING },
                    emailScript: { type: Type.STRING },
                    verbalPitch: { type: Type.STRING },
                    anticipatedPushback: { type: Type.STRING },
                    counterResponse: { type: Type.STRING },
                    feasibilityScore: { type: Type.STRING },
                  },
                  required: [
                    'title',
                    'goal',
                    'emailScript',
                    'verbalPitch',
                    'anticipatedPushback',
                    'counterResponse',
                    'feasibilityScore',
                  ],
                },
              },
              negotiatorMindsetTip: { type: Type.STRING },
            },
            required: ['strategies', 'negotiatorMindsetTip'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating negotiation playbook:', error);
    return res.status(500).json({
      error: formatErrorMessage(error),
    });
  }
});

// Vite or static serving
async function setupFrontend() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }
}

setupFrontend().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
});
