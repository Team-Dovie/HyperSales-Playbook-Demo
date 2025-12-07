import React, { useState, useRef, useEffect } from 'react';
import { CallSession, DialogueTurn } from '../../types';
import { Flex, Card, cn } from '../ui/Layout';
import { Badge, ResultBadge } from '../ui/Badge';
import { TemperatureChart } from './TemperatureChart';
import { ArrowLeft, User, MessageSquare, Thermometer, BrainCircuit, Sparkles, RefreshCw, Briefcase, Zap, HeartHandshake, Play, Pause, Flame, Snowflake, AlertCircle, Quote, Lightbulb, ArrowRight, Gauge, Clock, Target, DollarSign, BookOpen, Smile, Eye, Headphones, Plus } from 'lucide-react';
import { analyzeTranscript } from '../../services/geminiService';

interface AnalysisViewProps {
  session: CallSession;
  onBack: () => void;
  onUpdateSession: (updatedSession: CallSession) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ session, onBack, onUpdateSession }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Refs for scrolling to transcript parts
  const transcriptRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTranscript(session);
    
    if (result) {
      onUpdateSession({
        ...session,
        persona_analysis: result.persona,
        dialogue_flow: result.dialogue_flow.map(d => ({...d, timestamp: "00:00"})), // Default TS for new analysis
        summary: result.summary
      });
    }
    setIsAnalyzing(false);
  };

  const parseTimestamp = (ts: string): number => {
      const parts = ts.split(':');
      if (parts.length === 2) {
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
      return 0;
  };

  const togglePlay = () => {
      if (audioRef.current) {
          if (isPlaying) {
              audioRef.current.pause();
          } else {
              audioRef.current.play();
          }
          setIsPlaying(!isPlaying);
      }
  };

  const seekTo = (timestamp: string) => {
    if (audioRef.current) {
        const seconds = parseTimestamp(timestamp);
        audioRef.current.currentTime = seconds;
        audioRef.current.play();
        setIsPlaying(true);
    }
  };

  const handleChartPointClick = (sequence: number) => {
    const element = transcriptRefs.current[sequence];
    if (element) {
      // 1. Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 2. Highlight effect
      setActiveHighlight(sequence);
      setTimeout(() => setActiveHighlight(null), 2000);

      // 3. Play audio
      const turn = session.dialogue_flow.find(t => t.sequence === sequence);
      if (turn) {
        seekTo(turn.timestamp);
      }
    }
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
      }
  };
  
  // Determine currently active turn based on timestamp
  const getActiveTurnIndex = () => {
      let activeIndex = -1;
      session.dialogue_flow.forEach((turn, index) => {
          const turnTime = parseTimestamp(turn.timestamp);
          if (currentTime >= turnTime) {
              activeIndex = index;
          }
      });
      return activeIndex;
  };
  
  const activeTurnIndex = getActiveTurnIndex();

  // Derive Highlights based on temperature
  const winningMoments = session.dialogue_flow.filter(t => t.temperature_score >= 70);
  const frictionPoints = session.dialogue_flow.filter(t => t.temperature_score <= 40 || t.analysis?.includes('DROP'));

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const TraitGroup = ({ icon: Icon, title, traits }: { icon: any, title: string, traits: string[] | string }) => (
    <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2 text-gray-500">
        <Icon size={14} />
        <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.isArray(traits) ? (
          traits.length > 0 ? traits.map(t => (
            <span key={t} className="inline-flex px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
              {t}
            </span>
          )) : <span className="text-xs text-gray-300">N/A</span>
        ) : (
          <span className="inline-flex px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200">
            {traits}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Hidden Audio Element */}
      {session.audioUrl && (
          <audio 
             ref={audioRef} 
             src={session.audioUrl} 
             onTimeUpdate={handleTimeUpdate}
             onEnded={() => setIsPlaying(false)}
          />
      )}

      {/* Header Navigation */}
      <Flex align="center" gap={4}>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <Flex align="center" gap={3}>
            <h1 className="text-xl font-bold text-gray-900">{session.customer_company.name}</h1>
            <ResultBadge result={session.result} />
          </Flex>
          <p className="text-sm text-gray-500">{session.date}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            <span>{isAnalyzing ? 'AI Re-Analyze' : 'Run AI Diagnosis'}</span>
          </button>
        </div>
      </Flex>

      {/* 1. THE VIBE MATCH EQUATION */}
      <Card className="bg-gradient-to-r from-gray-50 to-white border-blue-100 shadow-md">
        <div className="p-8">
           <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              
              {/* Me */}
              <div className="flex flex-col items-center min-w-[150px]">
                 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-sm ring-4 ring-blue-50">
                    <User size={32} />
                 </div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Me (Agent)</div>
                 <div className="text-base font-bold text-gray-900">{session.agent_profile.features[0]}</div>
              </div>

              <div className="text-gray-300 hidden md:flex items-center justify-center">
                  <Plus size={32} />
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center min-w-[150px]">
                 <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3 shadow-sm ring-4 ring-purple-50">
                    <Briefcase size={32} />
                 </div>
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Opponent</div>
                 <div className="text-base font-bold text-gray-900">{session.persona_analysis.role}</div>
                 <div className="text-xs text-gray-500">{session.persona_analysis.personality_traits?.[0]}</div>
              </div>

              <div className="text-gray-300 hidden md:flex items-center justify-center mx-4">
                  <div className="text-4xl font-light">=</div>
              </div>

              {/* = Result Score */}
              <div className={cn("p-6 rounded-2xl border-2 flex flex-col items-center bg-white shadow-sm min-w-[200px]", getMatchColor(session.match_score))}>
                  <div className="flex items-center gap-2 mb-2">
                      <Gauge size={20} />
                      <span className="text-xs font-bold uppercase tracking-wide">Compatibility</span>
                  </div>
                  <div className="text-5xl font-black tracking-tight">{session.match_score}<span className="text-2xl text-gray-400 font-medium">/100</span></div>
              </div>
           </div>
        </div>
      </Card>

      {/* 2. CONTEXT & ME (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col border-t-4 border-t-teal-500 bg-white p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-teal-500"></span> Context & Channel
            </h3>
            <div className="flex items-center gap-4">
               <div className="p-3 bg-teal-50 text-teal-600 rounded-lg border border-teal-100">
                  {session.context.source.includes('Email') ? <MessageSquare size={20} /> : <Zap size={20} />}
               </div>
               <div>
                  <div className="text-lg font-bold text-gray-900">{session.context.source.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-500">Campaign: {session.context.campaign_version || 'General'}</div>
               </div>
            </div>
        </Card>

        <Card className="flex flex-col border-t-4 border-t-blue-500 bg-white p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span> Agent Profile (Me)
            </h3>
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                   <div className="text-xs text-gray-400">My Features</div>
                   <div className="flex gap-2 flex-wrap">
                      {session.agent_profile.features.map(t => (
                        <span key={t} className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">{t}</span>
                      ))}
                   </div>
                </div>
                <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>
                 <div className="flex flex-col gap-1">
                   <div className="text-xs text-gray-400">My Strengths</div>
                   <div className="flex gap-2 flex-wrap">
                      {session.agent_profile.strengths.slice(0,3).map(t => (
                        <span key={t} className="text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded">{t}</span>
                      ))}
                   </div>
                </div>
            </div>
        </Card>
      </div>

      {/* 3. DEEP CUSTOMER DNA (New Expanded Section) */}
      <Card className="border-t-4 border-t-purple-600 bg-gradient-to-b from-purple-50/50 to-white">
         <div className="p-5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                   <Briefcase size={18} className="text-purple-600" />
                   Deep Customer DNA Analysis
                </h3>
                <div className="text-right">
                   <span className="text-xs text-gray-500 block">Identified Role</span>
                   <span className="font-bold text-lg text-gray-900">{session.persona_analysis.role}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Personality */}
                <TraitGroup 
                   icon={User} 
                   title="Personality" 
                   traits={session.persona_analysis.personality_traits} 
                />
                
                {/* 2. Comm Style */}
                <TraitGroup 
                   icon={MessageSquare} 
                   title="Comm. Style" 
                   traits={session.persona_analysis.communication_style} 
                />

                {/* 3. Decision Making */}
                <TraitGroup 
                   icon={Target} 
                   title="Decision Profile" 
                   traits={session.persona_analysis.decision_making} 
                />

                {/* 4. Needs */}
                <TraitGroup 
                   icon={Zap} 
                   title="Needs Focus" 
                   traits={session.persona_analysis.need_orientation} 
                />

                {/* 5. Knowledge */}
                <TraitGroup 
                   icon={BookOpen} 
                   title="Domain Knowledge" 
                   traits={session.persona_analysis.domain_knowledge} 
                />

                {/* 6. Attitude */}
                <TraitGroup 
                   icon={Smile} 
                   title="Initial Attitude" 
                   traits={session.persona_analysis.initial_attitude} 
                />

                {/* 7. Budget */}
                <TraitGroup 
                   icon={DollarSign} 
                   title="Budget Sensitivity" 
                   traits={session.persona_analysis.budget_sensitivity} 
                />

                {/* 8. Time */}
                <TraitGroup 
                   icon={Clock} 
                   title="Time Pressure" 
                   traits={session.persona_analysis.time_pressure} 
                />
            </div>
         </div>
      </Card>


      {/* 4. SPLIT VIEW: ANALYSIS REPORT vs TRANSCRIPT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">
        
        {/* LEFT: ANALYSIS REPORT (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            
            <Card className="p-5 shrink-0">
                <Flex align="center" justify="between" className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Thermometer size={16} className="text-red-500" />
                    Temperature Flow
                </h3>
                </Flex>
                <TemperatureChart 
                  data={session.dialogue_flow} 
                  onPointClick={handleChartPointClick}
                />
            </Card>

            <Card className="p-5 shrink-0 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Key Moments
                </h3>
                
                {/* Winning Moments */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" /> Winning Moments
                    </h4>
                    {winningMoments.length > 0 ? winningMoments.map((turn) => (
                        <div 
                          key={turn.sequence} 
                          className="bg-green-50 border border-green-100 p-3 rounded-lg text-sm cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => handleChartPointClick(turn.sequence)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-green-800 text-xs">#{turn.key_topic}</span>
                                <span className="text-xs font-mono text-green-600">{turn.timestamp}</span>
                            </div>
                            <p className="text-gray-700 text-xs line-clamp-2">"{turn.agent_response}"</p>
                            {turn.analysis && <p className="mt-2 text-xs text-green-700 italic border-l-2 border-green-200 pl-2">{turn.analysis}</p>}
                        </div>
                    )) : <p className="text-xs text-gray-400 italic">No significant peaks detected.</p>}
                </div>

                 {/* Friction Points */}
                 <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                        <Snowflake size={12} className="text-blue-500" /> Friction Points
                    </h4>
                    {frictionPoints.length > 0 ? frictionPoints.map((turn) => (
                        <div 
                          key={turn.sequence} 
                          className="bg-white border border-red-200 shadow-sm p-3 rounded-lg text-sm group transition-all hover:shadow-md cursor-pointer hover:bg-red-50/50"
                          onClick={() => handleChartPointClick(turn.sequence)}
                        >
                             <div className="flex justify-between items-start mb-2">
                                <Badge variant="danger" className="text-[10px]">#{turn.key_topic}</Badge>
                                <span className="text-xs font-mono text-gray-400">{turn.timestamp}</span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mb-2">
                                <span className="font-semibold text-gray-900">Customer Said:</span> "{turn.prospect_ask}"
                            </div>
                            
                            {/* Analysis */}
                            <p className="text-gray-700 text-xs mb-3 bg-red-50 p-2 rounded border border-red-100">{turn.analysis}</p>

                            {/* Coaching Tip */}
                            {turn.coaching_tip && (
                                <div className="mb-2">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase mb-1">
                                        <BrainCircuit size={10} /> Strategy Logic
                                    </div>
                                    <p className="text-xs text-gray-600 italic">"{turn.coaching_tip}"</p>
                                </div>
                            )}

                            {/* Suggested Response */}
                            {turn.suggested_response && (
                                <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1 text-green-700 font-bold text-[10px] uppercase">
                                            <Lightbulb size={12} /> Coach's Fix
                                        </div>
                                        {/* Context Badge on Card */}
                                        <div className="text-[9px] px-1.5 py-0.5 bg-white rounded border border-green-200 text-green-600 font-semibold shadow-sm">
                                            For: {session.persona_analysis.personality_traits ? session.persona_analysis.personality_traits[0] : 'Matched'}
                                        </div>
                                    </div>
                                    <p className="text-gray-800 text-xs font-medium">"{turn.suggested_response}"</p>
                                </div>
                            )}
                        </div>
                    )) : <p className="text-xs text-gray-400 italic">No significant drop-offs detected.</p>}
                </div>
            </Card>
        </div>

        {/* RIGHT: TRANSCRIPT (60%) */}
        <Card className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white">
            {/* Transcript Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-gray-200 rounded-full shadow-sm">
                        <Quote size={16} className="text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Call Transcript</h3>
                        <p className="text-xs text-gray-500">Interactive playback mode</p>
                    </div>
                </div>
                {/* Audio Controls */}
                {session.audioUrl ? (
                     <div className="flex items-center gap-3">
                         <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                             {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                         </span>
                         <button 
                            onClick={togglePlay}
                            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                         >
                             {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
                         </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">No Audio Source</span>
                )}
            </div>

            {/* Scrollable Transcript List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
                {session.dialogue_flow.map((turn, index) => {
                    const isActive = index === activeTurnIndex;
                    const isHot = turn.temperature_score >= 70;
                    const isCold = turn.temperature_score <= 40;
                    const isFriction = isCold;
                    const isHighlighted = activeHighlight === turn.sequence;

                    return (
                        <div 
                          key={index} 
                          className={cn(
                             "space-y-4 scroll-mt-24 transition-all duration-500",
                             isHighlighted ? "bg-yellow-50 p-2 rounded-lg ring-2 ring-yellow-200" : ""
                          )} 
                          ref={el => {
                            transcriptRefs.current[turn.sequence] = el;
                          }}
                        >
                            
                            {/* 1. Prospect Turn */}
                            <div 
                                className={cn(
                                    "group flex gap-4 transition-opacity duration-300",
                                    isActive ? "opacity-100 scale-[1.01]" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs border border-purple-200">
                                        OP
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-400">{turn.timestamp}</span>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">Prospect</span>
                                    </div>
                                    <div 
                                        onClick={() => seekTo(turn.timestamp)}
                                        className={cn(
                                            "p-3 rounded-tr-xl rounded-b-xl text-sm text-gray-800 cursor-pointer transition-all border",
                                            "hover:bg-purple-50 hover:border-purple-200",
                                            isActive ? "bg-purple-50 border-purple-300 ring-2 ring-purple-100" : "bg-white border-gray-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-2">
                                            <div className="bg-gray-800 text-white p-1 rounded-full"><Play size={10} fill="white"/></div>
                                        </div>
                                        {turn.prospect_ask}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Agent Turn */}
                            <div 
                                className={cn(
                                    "group flex gap-4 transition-opacity duration-300",
                                    isActive ? "opacity-100 scale-[1.01]" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200">
                                        ME
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">Agent (Ken)</span>
                                        {/* Temperature Indicator Badge */}
                                        <span className={cn(
                                            "text-[10px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-1",
                                            isHot ? "bg-green-50 text-green-700 border-green-200" :
                                            isCold ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            "bg-gray-50 text-gray-600 border-gray-200"
                                        )}>
                                            {isHot ? <Flame size={10} /> : isCold ? <Snowflake size={10} /> : <Thermometer size={10} />}
                                            {turn.temperature_score}°
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <div 
                                            onClick={() => seekTo(turn.timestamp)}
                                            className={cn(
                                                "p-3 rounded-tr-xl rounded-b-xl text-sm cursor-pointer transition-all border flex-1 relative",
                                                "hover:bg-blue-50 hover:border-blue-200",
                                                isActive ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100 text-gray-900" : "bg-gray-50 border-gray-200 text-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-2">
                                                <div className="bg-gray-800 text-white p-1 rounded-full"><Play size={10} fill="white"/></div>
                                            </div>

                                            {turn.agent_response}
                                            
                                            {/* Inline Analysis Highlight if critical */}
                                            {turn.analysis && (
                                                <div className={cn(
                                                    "mt-3 text-xs p-3 rounded-lg border",
                                                    isFriction ? "bg-red-50 text-red-900 border-red-200" : "bg-indigo-50 text-indigo-900 border-indigo-200"
                                                )}>
                                                    <div className="flex items-start gap-1.5 mb-2">
                                                       {isFriction ? <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" /> : <Sparkles size={14} className="mt-0.5 shrink-0 text-indigo-600" />}
                                                       <span className="font-semibold">{turn.analysis}</span>
                                                    </div>

                                                    {/* Strategy Tip (Why) */}
                                                    {turn.coaching_tip && (
                                                        <div className="mb-2 pl-5">
                                                            <div className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">Strategy Insight</div>
                                                            <p className="text-gray-700 italic">{turn.coaching_tip}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Improved Response (What) */}
                                                    {isFriction && turn.suggested_response && (
                                                        <div className="mt-3 bg-white border border-green-300 rounded-md p-2 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                                            <div className="flex items-center justify-between mb-1 pl-2">
                                                                <div className="flex items-center gap-1 text-green-700 font-bold text-[10px] uppercase">
                                                                    <Lightbulb size={12} /> Coach's Fix
                                                                </div>
                                                                {/* Explicit Persona Tag */}
                                                                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                                                                    For: {session.persona_analysis.personality_traits ? session.persona_analysis.personality_traits[0] : 'Matched'}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-900 text-xs font-medium pl-2 leading-relaxed">"{turn.suggested_response}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </Card>

      </div>
    </div>
  );
};