
export enum CallResult {
  Success = 'Success',
  Fail = 'Fail',
  FollowUp = 'FollowUp'
}

export interface AgentProfile {
  name: string;
  features: string[]; // User defined "My Features" e.g. "Calm tone", "Direct communication"
  strengths: string[]; // User defined "My Strengths" e.g. "Clear value explanation"
  persuasion_match: string; // e.g. "Analytical people", "Relationship-based"
}

export interface CustomerCompany {
  name: string;
  revenue: string;
  industry: string;
  stage: string; // e.g. "Series A", "IPO"
}

// Expanded HyperSales Persona Categories
export interface PersonaAnalysis {
  role: string; // Job Title
  
  // 1. Personality Traits
  personality_traits: string[]; // e.g. "Fast-paced", "Skeptical", "Analytical"
  
  // 2. Communication Style
  communication_style: string[]; // e.g. "Short answers", "Data-driven"
  
  // 3. Decision Making
  decision_making: string[]; // e.g. "Decision-maker", "Needs approval"
  
  // 4. Need Orientation
  need_orientation: string[]; // e.g. "ROI-driven", "Cost-saving"
  
  // 5. Domain Knowledge
  domain_knowledge: string; // e.g. "Industry expert"
  
  // 6. Initial Attitude
  initial_attitude: string; // e.g. "Skeptical", "Open-minded"
  
  // 7. Budget Sensitivity
  budget_sensitivity: string; // e.g. "Price-first", "Value-first"
  
  // 8. Time Pressure
  time_pressure: string; // e.g. "Rushed", "Has time"

  // Legacy/Computed
  tone?: string;
  speed?: string;
  keywords?: string[]; // For backward compatibility or summary
}

export interface CallContext {
  source: string; // Relationship channel: Cold Email, Seminar, Inbound, Referral
  campaign_version?: string;
  prev_interaction?: string | null;
}

export interface DialogueTurn {
  sequence: number;
  prospect_ask: string;
  agent_response: string;
  temperature_score: number; // 0-100
  temperature_label: string;
  key_topic: string;
  analysis?: string; // AI Coach comments
  coaching_tip?: string; // The "Strategy/Why" behind the fix
  suggested_response?: string; // AI suggested improvement based on persona
  timestamp: string; // Audio timestamp e.g. "01:15"
}

export interface CallSession {
  id: string;
  date: string;
  audioUrl?: string; // URL to the audio file (blob or remote) for playback
  
  // Agent (Me)
  agent_profile: AgentProfile;
  
  // Customer (Them)
  customer_company: CustomerCompany;
  
  // Relationship / Context
  context: CallContext;
  
  // AI Analyzed Data
  result: CallResult;
  match_score: number; // 0-100 Compatibility Score
  strategy_diagnosis: string; // "Why" the match was high/low
  persona_analysis: PersonaAnalysis; // AI inferred personality of customer
  dialogue_flow: DialogueTurn[];
  summary: string;
}

export interface DashboardStats {
  totalCalls: number;
  successRate: number;
  failCount: number;
  avgDuration: string;
}
