
import React, { useState } from 'react';
import { Flex, Card, cn } from '../ui/Layout';
import { UploadCloud, FileAudio, FileText, X, ArrowRight, Loader2, CheckCircle2, Mic, AlertCircle, Search, Trash2, File, PlayCircle } from 'lucide-react';
import { LEAD_SOURCES, AGENT_ANALYTICAL } from '../../constants';
import { CallSession, CallResult } from '../../types';
import { analyzeCallFile } from '../../services/geminiService';

interface UploadViewProps {
  onCancel: () => void;
  onAnalysisComplete: (newSession: CallSession) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onCancel, onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0); // 0: Uploading, 1: Transcribing, 2: Analyzing, 3: Done
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validAudio = droppedFile.type.includes('audio') || droppedFile.name.match(/\.(mp3|wav|m4a|mp4)$/i);
      const validText = droppedFile.name.match(/\.(vtt|srt|txt)$/i);

      if (validAudio || validText) {
         setFile(droppedFile);
         setError(null);
      } else {
        setError("Please upload a valid audio (MP3, M4A) or transcript file (VTT, SRT, TXT)");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const startAnalysis = async () => {
    if (!file || !source) return;
    
    setIsProcessing(true);
    setProcessStage(0);
    setError(null);
    
    try {
        // Create an object URL for playback (only if audio)
        const isAudio = file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a|mp4)$/i);
        const fileUrl = isAudio ? URL.createObjectURL(file) : undefined;

        // Stage 1: Upload / Pre-processing
        setProcessStage(1);
        
        // Stage 2: AI Processing (Real Call)
        // Use a default agent profile for the "Me" context
        const partialSession = await analyzeCallFile(file, source, AGENT_ANALYTICAL);
        
        if (!partialSession) {
            throw new Error("Failed to analyze file. Please check your API key or try a clearer file.");
        }

        setProcessStage(2);

        // Stage 3: Finalizing
        setProcessStage(3);
        
        // Construct full session object
        const newSession: CallSession = {
            id: `call_${Date.now()}`,
            date: new Date().toLocaleString(),
            audioUrl: fileUrl, // Attach the real audio URL here (undefined if text)
            agent_profile: AGENT_ANALYTICAL,
            context: {
                source: source
            },
            // Merge AI results
            customer_company: partialSession.customer_company || {
                name: "Unknown Corp",
                revenue: "Unknown",
                industry: "Unknown",
                stage: "Unknown"
            },
            result: partialSession.result || CallResult.FollowUp,
            match_score: partialSession.match_score || 50,
            strategy_diagnosis: partialSession.strategy_diagnosis || "Analysis completed.",
            persona_analysis: partialSession.persona_analysis || {
                 role: "Unknown",
                 personality_traits: [],
                 communication_style: [],
                 decision_making: [],
                 need_orientation: [],
                 domain_knowledge: "Unknown",
                 initial_attitude: "Unknown",
                 budget_sensitivity: "Unknown",
                 time_pressure: "Unknown",
                 keywords: []
            },
            dialogue_flow: partialSession.dialogue_flow || [],
            summary: partialSession.summary || "No summary available."
        };
        
        // Small delay for UX
        setTimeout(() => {
            onAnalysisComplete(newSession);
        }, 1000);

    } catch (err) {
        console.error(err);
        setIsProcessing(false);
        setError("An error occurred during analysis. Please try again.");
    }
  };

  const ProcessStep = ({ label, stageIndex }: { label: string, stageIndex: number }) => {
     const isComplete = processStage > stageIndex;
     const isCurrent = processStage === stageIndex;

     return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0",
                isComplete ? "bg-green-500 border-green-500 text-white" :
                isCurrent ? "border-indigo-600 text-indigo-600 animate-pulse" :
                "border-gray-200 text-gray-300"
            )}>
                {isComplete ? <CheckCircle2 size={16} /> : isCurrent ? <Loader2 size={16} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
            </div>
            <span className={cn(
                "text-sm font-medium transition-colors",
                isComplete ? "text-green-700" : isCurrent ? "text-indigo-700 font-bold" : "text-gray-400"
            )}>{label}</span>
        </div>
     );
  };

  const isAudioFile = file && (file.type.includes('audio') || file.name.match(/\.(mp3|wav|m4a|mp4)$/i));

  return (
    <div className="max-w-7xl mx-auto px-6 h-full flex flex-col">
      {/* Header */}
      <div className="py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
          <div className="relative w-80 hidden md:block">
            <input 
              type="text" 
              placeholder="Search by title or keyword" 
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
        {isProcessing ? (
             <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8 animate-pulse ring-4 ring-indigo-50/50">
                    <Mic size={48} className="text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Conversation...</h3>
                <p className="text-gray-500 mb-10 text-center max-w-md text-lg">Our AI is processing the file, identifying the persona, and mapping the temperature flow.</p>
                
                <div className="w-full max-w-md bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <ProcessStep label="Uploading File..." stageIndex={0} />
                    <ProcessStep label={isAudioFile ? "Transcribing Voice to Text..." : "Parsing Transcript..."} stageIndex={1} />
                    <ProcessStep label="Analyzing Deep Customer DNA..." stageIndex={2} />
                    <ProcessStep label="Generating Coaching Report..." stageIndex={3} />
                </div>
             </div>
        ) : (
            <div className="h-full flex flex-col">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Fireflies Style Dropzone */}
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center transition-all duration-200 mb-10",
                        isDragOver 
                            ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" 
                            : "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/20"
                    )}
                >
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-500">
                             <UploadCloud size={32} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Upload a file to generate a transcript</h3>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        Browse or drag and drop MP3, M4A, WAV, MP4 or <strong>VTT/SRT</strong> files.<br/>
                        <span className="text-xs text-gray-400">(Max audio size: 50MB)</span>
                    </p>
                    
                    <button 
                        onClick={() => document.getElementById('audio-upload')?.click()}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        Browse Files
                    </button>
                    <input 
                        id="audio-upload" 
                        type="file" 
                        className="hidden" 
                        accept="audio/*,.vtt,.srt,.txt"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* Pending Upload Row */}
                {file && (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                            
                            {/* File Info */}
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-14 h-14 text-white rounded-lg flex flex-col items-center justify-center font-bold text-[10px] uppercase shadow-sm",
                                    isAudioFile ? "bg-indigo-600" : "bg-teal-600"
                                )}>
                                    {isAudioFile ? <FileAudio size={20} className="mb-1" /> : <FileText size={20} className="mb-1" />}
                                    {file.name.split('.').pop()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{file.name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            {isAudioFile ? <PlayCircle size={12} /> : <FileText size={12} />} 
                                            {isAudioFile ? "Ready to analyze audio" : "Ready to analyze transcript"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Area */}
                            <div className="flex items-center gap-6">
                                {/* Lead Source Dropdown */}
                                <div className="flex flex-col gap-1.5 min-w-[240px]">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                        Lead Source <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        value={source} 
                                        onChange={(e) => setSource(e.target.value)}
                                        className="text-sm font-medium border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                                    >
                                        <option value="" disabled>Select Channel...</option>
                                        {LEAD_SOURCES.map(src => (
                                            <option key={src} value={src}>{src}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="h-10 w-px bg-gray-200"></div>

                                <button 
                                    onClick={() => setFile(null)}
                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove file"
                                >
                                    <Trash2 size={20} />
                                </button>
                                
                                <button
                                    onClick={startAnalysis}
                                    disabled={!source}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>Start Analysis</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
