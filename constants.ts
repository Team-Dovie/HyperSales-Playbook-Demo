
import { CallSession, CallResult } from './types';

export const LEAD_SOURCES = [
    "Cold Email",
    "Cold Calling",
    "Linkedin DM",
    "Inbound Lead (Website Demo Request, Contact Form)",
    "Referral / Introduction",
    "Seminar / Webinar",
    "Event Booth Lead",
    "Networking Event Lead"
];

export const AGENT_ANALYTICAL = {
  name: "Ken",
  features: ["Calm tone", "Logical response pattern", "Structured thinking", "Direct communication"],
  strengths: ["Clear value explanation", "High product knowledge", "Good at handling objections calmly"],
  persuasion_match: "Analytical / C-Level Execs"
};

export const AGENT_RELATIONAL = {
  name: "Ken",
  features: ["Friendly & approachable", "High adaptability", "Easily empathetic", "Fast-paced speaking"],
  strengths: ["Strong rapport building", "Creates trust quickly", "Reads buyer interest well", "Mood lifting"],
  persuasion_match: "Relationship-focused / HR"
};

export const MOCK_SESSIONS: CallSession[] = [
  {
    id: "call_20251027_004",
    date: "2025-10-27 14:20",
    agent_profile: AGENT_RELATIONAL, // Mismatch: Warm agent vs Skeptical Data-driven client
    customer_company: {
      name: "GenieSoo Inc.",
      revenue: "$5M ARR",
      industry: "E-Commerce",
      stage: "Series A"
    },
    result: CallResult.Fail,
    match_score: 35,
    strategy_diagnosis: "High Energy Clash. The prospect wanted rapid facts (Cold Email context), but the agent used relationship-building techniques.",
    context: {
      source: "Cold Email",
      campaign_version: "Targeting_SMB_Marketing"
    },
    persona_analysis: {
      role: "Marketing Manager",
      personality_traits: ["Skeptical", "Direct", "Consumer-mindset"],
      communication_style: ["Short answers", "Data-driven"],
      decision_making: ["Influencer", "Needs team review"],
      need_orientation: ["ROI-driven", "Cost-saving focused"],
      domain_knowledge: "Familiar but not expert",
      initial_attitude: "Defensive",
      budget_sensitivity: "Price-first",
      time_pressure: "Rushed",
      keywords: ["Direct", "Price-Sensitive", "Cynical"]
    },
    summary: "Agent's warm approach clashed with client's direct, cynical style. Price revealed too early without data backing.",
    dialogue_flow: [
      {
        sequence: 1,
        prospect_ask: "Is this another generic scraping tool? What exactly is it?",
        agent_response: "No, we are an outbound specific solution that finds corporate data and verified contacts.",
        temperature_score: 50,
        temperature_label: "Neutral",
        key_topic: "Product Intro",
        timestamp: "00:15"
      },
      {
        sequence: 2,
        prospect_ask: "Does it work for targeting commerce companies? That's our main niche.",
        agent_response: "Yes! We actually increased conversion rates by 5% for similar clients, and Toss uses us too.",
        temperature_score: 75,
        temperature_label: "Heating Up",
        key_topic: "Social Proof",
        analysis: "Good use of reference (Toss). Interest peaked here.",
        timestamp: "01:20"
      },
      {
        sequence: 3,
        prospect_ask: "Okay, what's the price structure?",
        agent_response: "It starts at $6,000 and it's pay-per-use.",
        temperature_score: 30,
        temperature_label: "Cooling Down",
        key_topic: "Pricing",
        analysis: "CRITICAL DROP: Price revealed too early.",
        coaching_tip: "Strategy Error: You are in a 'Cold Email' context with a 'Price-Sensitive' buyer. Never drop the price without anchoring value first.",
        suggested_response: "Since you are in Series A, ROI is key. Instead of a flat fee, our model scales with your generated leads. Can I share a case study on ROI first?",
        timestamp: "02:45"
      },
      {
        sequence: 4,
        prospect_ask: "Just send me the brochure. I'll report it internally and get back to you.",
        agent_response: "Sure, I will send it right away.",
        temperature_score: 15,
        temperature_label: "Cold",
        key_topic: "Closing",
        analysis: "Defensive close failure. 'Send brochure' is a brush-off.",
        coaching_tip: "Persona Mismatch: The 'Cynical' persona needs you to challenge them, not comply. Ask for their specific metric.",
        suggested_response: "I understand you need to report this. To save you time, which specific metric does your VP care about most? I'll highlight that in the summary.",
        timestamp: "03:10"
      }
    ]
  },
  {
    id: "call_20251027_001",
    date: "2025-10-27 10:30",
    agent_profile: AGENT_ANALYTICAL, // Match: Analytical agent vs Logic-driven client
    customer_company: {
      name: "Socar",
      revenue: "$200M ARR",
      industry: "Mobility",
      stage: "IPO Ready"
    },
    result: CallResult.Success,
    match_score: 92,
    strategy_diagnosis: "Perfect Resonance. The Agent's logical strength aligned with the VP's data-driven role and the trust from the Referral.",
    context: {
      source: "Referral / Introduction",
      prev_interaction: "LinkedIn Message from Min"
    },
    persona_analysis: {
      role: "VP of Sales",
      personality_traits: ["Analytical", "Logical", "Big-picture thinker"],
      communication_style: ["Listens fully", "Data-driven"],
      decision_making: ["Decision-maker", "Fast decision-maker"],
      need_orientation: ["Scale", "Automation-driven"],
      domain_knowledge: "Experienced SaaS buyer",
      initial_attitude: "Problem-driven",
      budget_sensitivity: "Value-first",
      time_pressure: "Has time",
      keywords: ["Logical", "Data-Driven", "Objective"]
    },
    summary: "Strong match. Agent's logical approach resonated with the VP's need for scale and metrics.",
    dialogue_flow: [
      {
        sequence: 1,
        prospect_ask: "Hello Ken, received your message regarding the referral from Min.",
        agent_response: "Hi! Yes, Min mentioned you're looking to automate lead gen.",
        temperature_score: 60,
        temperature_label: "Warm",
        key_topic: "Opening",
        timestamp: "00:10"
      },
      {
        sequence: 2,
        prospect_ask: "We need scale. Can you handle 50k leads a month?",
        agent_response: "Absolutely. We process over 1M for our enterprise tier with 99.8% uptime.",
        temperature_score: 85,
        temperature_label: "Hot",
        key_topic: "Capability Check",
        analysis: "Specific metrics (1M, 99.8%) built immediate trust with analytical buyer.",
        timestamp: "01:30"
      },
      {
        sequence: 3,
        prospect_ask: "Let's schedule a demo for the team.",
        agent_response: "Great, how is next Tuesday 2 PM?",
        temperature_score: 95,
        temperature_label: "Closed",
        key_topic: "Scheduling",
        timestamp: "03:50"
      }
    ]
  },
  {
    id: "call_20251027_002",
    date: "2025-10-27 11:15",
    agent_profile: AGENT_RELATIONAL,
    customer_company: {
      name: "Toss",
      revenue: "$500M+ ARR",
      industry: "Fintech",
      stage: "Unicorn"
    },
    result: CallResult.Success,
    match_score: 88,
    strategy_diagnosis: "High Energy Match. The 'Inbound' context implies interest, and the Agent's 'Warm' style amplified the prospect's curiosity.",
    context: {
      source: "Inbound Lead (Website Demo Request, Contact Form)",
    },
    persona_analysis: {
      role: "Growth Manager",
      personality_traits: ["Experimental", "Curious", "Fast-paced"],
      communication_style: ["Question-heavy", "Ad-hoc"],
      decision_making: ["Influencer", "Fast decision-maker"],
      need_orientation: ["Innovation-seeker", "Speed-oriented"],
      domain_knowledge: "Familiar but not expert",
      initial_attitude: "High intent",
      budget_sensitivity: "Value-first",
      time_pressure: "Short on time",
      keywords: ["Inquisitive", "Open", "Action-Oriented"]
    },
    summary: "Inbound lead converted quickly. High energy match.",
    dialogue_flow: [
      { 
        sequence: 1, 
        prospect_ask: "Saw the demo video, looks interesting.", 
        agent_response: "Glad you liked it! Which part caught your eye?", 
        temperature_score: 70, 
        temperature_label: "Warm", 
        key_topic: "Discovery",
        timestamp: "00:20"
      },
      { 
        sequence: 2, 
        prospect_ask: "The API integration part.", 
        agent_response: "Our API is fully RESTful. I can send docs immediately.", 
        temperature_score: 80, 
        temperature_label: "Hot", 
        key_topic: "Technical",
        timestamp: "01:10"
      }
    ]
  },
  {
    id: "call_20251027_003",
    date: "2025-10-27 13:00",
    agent_profile: AGENT_ANALYTICAL,
    customer_company: {
      name: "Ekice Corp",
      revenue: "Unknown",
      industry: "Manufacturing",
      stage: "SMB"
    },
    result: CallResult.Fail,
    match_score: 20,
    strategy_diagnosis: "Timing Mismatch. Analytical 'Opening' failed because the 'Cold Email' context + 'Busy CEO' persona required a hook, not an introduction.",
    context: {
      source: "Cold Email",
    },
    persona_analysis: {
      role: "CEO",
      personality_traits: ["Impulsive", "Direct", "Closed-off"],
      communication_style: ["Interrupts frequently", "Short answers"],
      decision_making: ["Decision-maker"],
      need_orientation: ["Short-term results"],
      domain_knowledge: "Zero preparation",
      initial_attitude: "Uninterested",
      budget_sensitivity: "Unknown",
      time_pressure: "Distracted / multitasking",
      keywords: ["Busy", "Not Interested", "Direct"]
    },
    summary: "Gatekeeper blockage. Analytical opening failed to break the ice with busy CEO.",
    dialogue_flow: [
      { 
        sequence: 1, 
        prospect_ask: "Who is this? I'm in a meeting.", 
        agent_response: "Sorry, this is Ken from Vibe Flow...", 
        temperature_score: 20, 
        temperature_label: "Cold", 
        key_topic: "Opening", 
        analysis: "Bad timing. Analytical approach (stating name/company) failed to hook.",
        coaching_tip: "Persona Adaptation: 'Busy CEOs' (Persona) in 'Cold Calls' (Context) don't care about your name. Start with the problem.",
        suggested_response: "I apologize. I'll be brief—I'm calling about the manufacturing efficiency issue you posted about. When is a better 2-minute window?",
        timestamp: "00:05"
      },
      { 
        sequence: 2, 
        prospect_ask: "Not interested, please remove me.", 
        agent_response: "Understood, have a nice day.", 
        temperature_score: 0, 
        temperature_label: "Frozen", 
        key_topic: "Rejection",
        timestamp: "00:25"
      }
    ]
  }
];