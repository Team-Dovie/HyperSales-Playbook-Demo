
import { GoogleGenAI, Type } from "@google/genai";
import { DialogueTurn, PersonaAnalysis, CallSession, AgentProfile, CallResult } from "../types";

// This simulates the structure of the response we want from Gemini
interface AIAnalysisResult {
  persona: PersonaAnalysis;
  dialogue_flow: DialogueTurn[];
  summary: string;
}

// Full response for audio analysis including call-level metrics
interface AudioAnalysisResult extends AIAnalysisResult {
  customer_company: {
    name: string;
    revenue: string;
    industry: string;
    stage: string;
  };
  result: CallResult;
  match_score: number;
  strategy_diagnosis: string;
}

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key missing");
    return null;
  }
  return key;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove data:audio/mp3;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const fileToString = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// HYPERSALES FRAMEWORK CATEGORIES
const PERSONA_CATEGORIES = `
  - **Personality Traits**: Fast-paced, Slow-paced, Skeptical, Direct, Calm, Analytical, Reactive/Emotional, Logical, Detail-oriented, Big-picture thinker, Defensive, Cooperative, Confrontational, Friendly, Closed-off, Pragmatic, Perfectionist, Avoidant, Strong-willed, Impulsive, Cautious, Consumer-mindset, Experimental
  - **Communication Style**: Short answers, Long explanatory answers, Question-heavy, Interrupts frequently, Listens fully before responding, Asks for summary, Data-driven, Needs examples, Asks same question repeatedly, Confused often, Seeks reassurance, Negative/reactive, Jumps to conclusion, Silent listener, Testing you
  - **Decision Making**: Final Decision-maker, Influencer, Researcher, Needs internal approval, Budget owner, Budget requester, Procurement involved, Fast decision-maker, Needs team review, Slow decision cycle, Process-heavy decision, PoC first decision style
  - **Need Orientation**: ROI-driven, Cost-saving focused, Risk-averse, Feature-oriented, Speed-oriented, Automation-driven, Accuracy-focused, Data-quality oriented, Innovation-seeker, Competitive benchmarking, Ease-of-adoption focused, Workload-reduction, Simplification-focused, Short-term results, Long-term value
  - **Domain Knowledge**: Industry expert, Experienced SaaS buyer, Familiar but not expert, Basic understanding, New to topic, Pre-read materials, Zero preparation, Actively comparing others, Fed info by teammate
  - **Initial Attitude**: Highly interested, Open-minded, Neutral, Skeptical, Defensive, Uninterested, Negative predisposition, Curious, Problem-driven, Research-only, High intent, No-budget exploration
  - **Budget Sensitivity**: Very budget-sensitive, Mid-level sensitive, Comfortable budget, Value-first, Price-first, Needs approval, Fixed threshold, Upfront-friendly, Has only PoC budget
  - **Time Pressure**: Has time, Short on time, Rushed, In-between meetings, Distracted / multitasking, Call on the go, Remote distracted mode
`;

export const analyzeCallFile = async (
  file: File,
  contextSource: string,
  agentProfile: AgentProfile
): Promise<Partial<CallSession> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  // Determine if Audio or Text
  const isAudio = file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a|mp4)$/i);
  
  let userContent: any;
  let taskInstruction = "";

  if (isAudio) {
      const base64Audio = await fileToBase64(file);
      userContent = {
        parts: [
          { inlineData: { mimeType: file.type || "audio/mp3", data: base64Audio } },
          { text: "Analyze this sales call. IMPORTANT: Fill ALL Deep Customer DNA fields. Infer from tone if text is brief." }
        ]
      };
      taskInstruction = `
        1. **Listen** to the audio to identify the Customer's **Voice Tone**, **Pacing**, and **Emotional shifts**.
        2. **Transcribe** the conversation into a structured dialogue flow with precise timestamps.
      `;
  } else {
      // Text / VTT Mode
      const textContent = await fileToString(file);
      userContent = `
        Analyze the following Transcript (VTT/Text).
        
        TRANSCRIPT DATA:
        ${textContent}
        
        IMPORTANT: Fill ALL Deep Customer DNA fields. Since you cannot hear tone, infer traits from **sentence structure**, **word choice**, **question type**, and **explicit statements**.
      `;
      taskInstruction = `
        1. **Read** the provided transcript text.
        2. **Parse** the dialogue into the structured dialogue flow (preserve timestamps if available, otherwise estimate).
      `;
  }

  const systemInstruction = `
    You are "Sales Vibe Coach", an elite sales psychologist AI.
    
    **TASK**:
    ${taskInstruction}
    
    3. **Profile the Customer (MANDATORY)** using the **HyperSales DNA Framework**. 
       - You **MUST** populate ALL persona fields below. 
       - **DO NOT** leave any field empty.
       - Use the provided options lists as your primary source for tags.

    **HYPERSALES CATEGORIES (Pick best matches)**:
    ${PERSONA_CATEGORIES}

    4. **Evaluate the "Compatibility Score"** (Vibe Match).
       - Evaluate strictly between **Agent Ken's Profile** (Features: ${agentProfile.features.join(", ")}) and the **Customer's DNA** (Personality, Style).
       - **IGNORE** the Lead Source/Channel for the numerical score calculation. The score represents personality/communication fit only.
    
    **CONTEXT**:
    - **Agent**: Ken.
    - **Lead Source**: ${contextSource} (Use this for general context analysis, but not for the compatibility score).
    
    **OUTPUT REQUIREMENTS (JSON)**:
    - **customer_company**: Infer name/industry from context. If unknown, guess "Unknown Corp" or relevant industry.
    - **match_score**: 0-100 (Agent Personality vs Customer Personality).
    - **strategy_diagnosis**: Explain the match score based on personality fit.
    - **persona**:
       - **role**: Job title (Guess if not explicit).
       - **personality_traits**: [MANDATORY] Pick 3+ from the list.
       - **communication_style**: [MANDATORY] Pick 2+ from the list.
       - **decision_making**: [MANDATORY] Pick 1+.
       - **need_orientation**: [MANDATORY] Pick 1+.
       - **domain_knowledge**: [MANDATORY] Pick 1.
       - **initial_attitude**: [MANDATORY] Pick 1.
       - **budget_sensitivity**: [MANDATORY] Pick 1.
       - **time_pressure**: [MANDATORY] Pick 1.
    - **dialogue_flow**:
       - **temperature_score**: 0-100 (Sentiment of the turn).
       - **analysis**: Why did the temp drop/rise?
       - **suggested_response**: If temp < 50, provide a better script tailored to the Persona.
       - **coaching_tip**: The strategy logic (Why this fix?).
       - **timestamp**: Format "MM:SS" (e.g. "00:15").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: isAudio ? userContent : { parts: [{ text: userContent }] },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customer_company: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                revenue: { type: Type.STRING },
                industry: { type: Type.STRING },
                stage: { type: Type.STRING }
              }
            },
            result: { type: Type.STRING, enum: ["Success", "Fail", "FollowUp"] },
            match_score: { type: Type.INTEGER },
            strategy_diagnosis: { type: Type.STRING },
            persona: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                personality_traits: { type: Type.ARRAY, items: { type: Type.STRING } },
                communication_style: { type: Type.ARRAY, items: { type: Type.STRING } },
                decision_making: { type: Type.ARRAY, items: { type: Type.STRING } },
                need_orientation: { type: Type.ARRAY, items: { type: Type.STRING } },
                domain_knowledge: { type: Type.STRING },
                initial_attitude: { type: Type.STRING },
                budget_sensitivity: { type: Type.STRING },
                time_pressure: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            summary: { type: Type.STRING },
            dialogue_flow: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sequence: { type: Type.INTEGER },
                  prospect_ask: { type: Type.STRING },
                  agent_response: { type: Type.STRING },
                  temperature_score: { type: Type.INTEGER },
                  temperature_label: { type: Type.STRING },
                  key_topic: { type: Type.STRING },
                  analysis: { type: Type.STRING, nullable: true },
                  coaching_tip: { type: Type.STRING, nullable: true },
                  suggested_response: { type: Type.STRING, nullable: true },
                  timestamp: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as Partial<CallSession>;

  } catch (error) {
    console.error("Gemini File Analysis Failed", error);
    return null;
  }
};

export const analyzeTranscript = async (
  session: CallSession
): Promise<AIAnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  // Extract transcript for text analysis
  const transcriptText = session.dialogue_flow.map(t => 
    `Timestamp: ${t.timestamp}\nProspect: ${t.prospect_ask}\nAgent: ${t.agent_response}`
  ).join('\n\n');

  const systemInstruction = `
    You are "Sales Vibe Coach", an expert sales intelligence AI.
    
    **Goal**: Analyze the sales call transcript to understand why the meeting succeeded or failed.
    You must evaluate the fit between the Agent's profile and the Customer's profile/context.

    **INPUT DATA**:
    1. **ME (Agent Profile)**: Features: [${session.agent_profile.features.join(", ")}].
    2. **OPPONENT (Customer Context)**: Company: ${session.customer_company.name}. Context: ${session.context.source}.
    
    **TASK**:
    1. **Infer Customer Persona (HYPERSALES DNA) - MANDATORY**:
       - You **MUST** populate ALL fields. **DO NOT** return empty arrays.
       - Infer traits from the text style (e.g., short sentences = 'Direct', 'Rushed').
       - Use these lists:
       ${PERSONA_CATEGORIES}
    
    2. **Analyze Dialogue Flow**:
       - Review each Q&A pair.
       - **Temperature Scoring (0-100)**.
       - **Coaching**: If temp < 50, provide a specific 'suggested_response' and explain the 'coaching_tip' (Strategy).
    
    3. **Summary**: Strategic diagnosis.
    
    4. **Evaluate Compatibility Score**:
       - Calculate score (0-100) based strictly on Agent Personality vs Customer Persona.
       - Do NOT consider the Lead Source/Channel for the numeric score.

    Return JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: transcriptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            persona: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                personality_traits: { type: Type.ARRAY, items: { type: Type.STRING } },
                communication_style: { type: Type.ARRAY, items: { type: Type.STRING } },
                decision_making: { type: Type.ARRAY, items: { type: Type.STRING } },
                need_orientation: { type: Type.ARRAY, items: { type: Type.STRING } },
                domain_knowledge: { type: Type.STRING },
                initial_attitude: { type: Type.STRING },
                budget_sensitivity: { type: Type.STRING },
                time_pressure: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            summary: { type: Type.STRING },
            dialogue_flow: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sequence: { type: Type.INTEGER },
                  prospect_ask: { type: Type.STRING },
                  agent_response: { type: Type.STRING },
                  temperature_score: { type: Type.INTEGER },
                  temperature_label: { type: Type.STRING },
                  key_topic: { type: Type.STRING },
                  analysis: { type: Type.STRING, nullable: true },
                  coaching_tip: { type: Type.STRING, nullable: true },
                  suggested_response: { type: Type.STRING, nullable: true }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return null;
  }
};
