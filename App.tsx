
import React, { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultView } from './components/ResultView';
import { analyzeEvent } from './services/geminiService';
import { AnalysisResult, LoadingState, AnalysisMode } from './types';
import { AlertCircle, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<AnalysisMode>('deep');

  const handleSearch = async (query: string, mode: AnalysisMode) => {
    setStatus(LoadingState.SEARCHING);
    setErrorMsg('');
    setResult(null);
    setCurrentMode(mode);

    try {
      const data = await analyzeEvent(query, mode);
      setResult(data);
      setStatus(LoadingState.COMPLETE);
    } catch (err) {
      console.error(err);
      setErrorMsg("无法分析该事件。可能事件过于冷门或连接出现问题，请稍后重试。");
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <Header />

      <main className="relative container mx-auto px-4 sm:px-6 py-8 md:py-16 flex-grow">
        {status === LoadingState.IDLE && (
          <div className="animate-in fade-in zoom-in duration-700 mt-10 md:mt-20">
            <SearchBar onSearch={handleSearch} isLoading={false} />
          </div>
        )}

        {status === LoadingState.SEARCHING && (
          <div className="w-full max-w-3xl mx-auto text-center py-20 space-y-6 animate-in fade-in duration-500">
            <div className="relative mx-auto w-24 h-24">
               <div className={`absolute inset-0 border-t-4 border-solid rounded-full animate-spin ${currentMode === 'fast' ? 'border-amber-500' : 'border-blue-500'}`}></div>
               <div className={`absolute inset-2 border-b-4 border-solid rounded-full animate-spin reverse ${currentMode === 'fast' ? 'border-orange-500' : 'border-purple-500'}`}></div>
            </div>
            <h3 className="text-2xl font-medium text-slate-200">
              {currentMode === 'fast' ? '快速扫描中...' : '深度分析中...'}
            </h3>
            <p className="text-slate-400">正在查询实时来源和历史数据库。</p>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="w-full max-w-2xl mx-auto text-center animate-in shake duration-300 mt-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">分析失败</h3>
            <p className="text-slate-400 mb-8">{errorMsg}</p>
            <button 
              onClick={() => setStatus(LoadingState.IDLE)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {status === LoadingState.COMPLETE && result && (
          <div className="space-y-8 md:space-y-12">
             <div className="flex justify-center">
               <button 
                  onClick={() => setStatus(LoadingState.IDLE)}
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-800/50"
                >
                  ← 研究其他事件
                </button>
             </div>
            <ResultView data={result} />
          </div>
        )}
      </main>

      <footer className="w-full py-8 text-center relative z-10 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 opacity-80 hover:opacity-100 transition-opacity">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium tracking-wide">Powered by Google Gemini</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} Cyberceratops. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
