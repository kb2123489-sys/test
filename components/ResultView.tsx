import React from 'react';
import { AnalysisResult } from '../types';
import { ExternalLink, History, Zap, Globe, ArrowRight } from 'lucide-react';

interface ResultViewProps {
  data: AnalysisResult;
}

// Helper to render markdown (bold) and handle paragraphs
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Split text by newlines to handle paragraphs
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-4">
      {lines.map((line, lineIdx) => {
        // Split by **bold** using lazy matching
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lineIdx} className="leading-relaxed text-slate-300">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                // Remove asterisks and render bold
                return <strong key={partIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
              }
              return <span key={partIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const ResultView: React.FC<ResultViewProps> = ({ data }) => {
  const { parsed, sources } = data;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
      
      {/* 1. Hero Section: Title & Summary */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden border-t border-blue-500/30">
        <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] pointer-events-none">
          <Globe className="w-80 h-80 text-blue-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              分析完成
            </div>
            <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            <MarkdownText text={parsed.title || "事件分析"} />
          </h2>
          
          <div className="text-lg md:text-xl text-slate-300 leading-relaxed border-l-2 border-blue-500/50 pl-6">
            <MarkdownText text={parsed.summary} />
          </div>
        </div>
      </div>

      {/* 2. Core Impact Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">核心影响</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {parsed.impacts.map((impact, index) => (
            <div 
              key={index} 
              className="glass-panel p-6 rounded-2xl hover:bg-slate-800/80 transition-all duration-300 border border-white/5 hover:border-amber-500/30 group"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono border border-slate-700 mt-0.5 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors">
                  {index + 1}
                </span>
                <div className="text-base">
                  <MarkdownText text={impact} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Historical Context Section - Full Width below impacts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">历史回响</h3>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-purple-900/10">
           <div className="prose prose-invert max-w-none">
             <MarkdownText text={parsed.historicalContext} />
           </div>
           <div className="mt-8 flex items-center gap-2 text-purple-400 text-sm font-medium opacity-80">
             <History className="w-4 h-4" />
             <span>历史总是押着相同的韵脚</span>
           </div>
        </div>
      </section>

      {/* 4. Sources Section */}
      {sources.length > 0 && (
        <div className="pt-8 border-t border-slate-800/60">
          <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider px-2">
            参考来源
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono border border-slate-700">
                    {idx + 1}
                  </div>
                  <span className="truncate text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {source.title}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};