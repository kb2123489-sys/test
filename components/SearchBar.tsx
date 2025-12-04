
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, Zap, BrainCircuit } from 'lucide-react';
import { AnalysisMode } from '../types';
import { getTrendingTopics } from '../services/geminiService';

interface SearchBarProps {
  onSearch: (query: string, mode: AnalysisMode) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('deep');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([
    "最近的互联网大瘫痪",
    "最新 AI 模型发布的影响",
    "本周网络安全漏洞",
    "社交媒体新规"
  ]);

  useEffect(() => {
    // Fetch real trending topics on mount
    const fetchTopics = async () => {
      const topics = await getTrendingTopics();
      if (topics && topics.length > 0) {
        setTrendingTopics(topics);
      }
    };
    fetchTopics();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSearch(input, mode);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-16 text-center">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
        解读数字时代的 <span className="gradient-text">脉搏</span>
      </h2>
      <p className="text-slate-400 mb-8 text-lg">
        即时总结重大科技事件，深度分析影响，寻找历史镜像。
      </p>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-900/80 border border-slate-700 p-1 rounded-xl inline-flex items-center gap-1">
          <button
            onClick={() => setMode('fast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'fast' 
                ? 'bg-amber-500/20 text-amber-500 shadow-sm border border-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            快速模式 (Flash)
          </button>
          <button
            onClick={() => setMode('deep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'deep' 
                ? 'bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            深度模式 (Pro)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r ${mode === 'fast' ? 'from-amber-500 to-orange-600' : 'from-blue-600 to-purple-600'} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500`}></div>
        <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl">
          <Search className="ml-4 w-6 h-6 text-slate-500 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'fast' ? "快速分析事件 (预计 5秒)..." : "深度分析事件 (预计 15秒)..."}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-white px-4 py-3 text-lg placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 min-w-fit ${
              mode === 'fast' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                开始分析 <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <span className="text-sm text-slate-500 py-1">热门话题:</span>
        {trendingTopics.map((topic, idx) => (
          <button
            key={`${topic}-${idx}`}
            onClick={() => {
              setInput(topic);
              onSearch(topic, mode);
            }}
            disabled={isLoading}
            className="text-sm px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-yellow-500" />
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};
