import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Sparkles } from 'lucide-react';
import { ResultView } from './ResultView';
import { SharedAnalysisData } from '../utils/shareUtils';

interface SharedViewProps {
  sharedData: SharedAnalysisData;
  onStartNewAnalysis: () => void;
}

export const SharedView: React.FC<SharedViewProps> = ({
  sharedData,
  onStartNewAnalysis,
}) => {
  const { t } = useTranslation();
  
  const { analysisResult, shareOptions, originalQuery, customTitle } = sharedData;
  
  // Determine display title based on share options
  const displayTitle = customTitle || (shareOptions.includeQuery && originalQuery) 
    ? (customTitle || originalQuery) 
    : t('share.sharedAnalysis');

  // Filter sources if not included in share options
  const displayResult = shareOptions.includeSources 
    ? analysisResult 
    : { ...analysisResult, sources: [] };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Header with shared indicator */}
      <div className="sticky top-0 z-20 bg-[#0f172a]/80 backdrop-blur-sm border-b border-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Shared Analysis Badge */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('sharedView.badge')}</span>
              </div>
            </div>
            
            {/* Start New Analysis Button */}
            <button
              onClick={onStartNewAnalysis}
              className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{t('sharedView.startNew')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query/Title Display */}
      <div className="container mx-auto px-4 sm:px-6 pt-6">
        <div className="max-w-4xl mx-auto mb-6">
          <div className="glass-panel rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">{t('sharedView.queryLabel')}</p>
            <p className="text-lg md:text-xl font-medium text-white">{displayTitle}</p>
          </div>
        </div>
      </div>

      {/* Result Content */}
      <main className="relative container mx-auto px-4 sm:px-6 py-2">
        <ResultView data={displayResult} />
      </main>

      {/* Call to Action */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-6 md:p-8 text-center border border-slate-700/50">
            <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
              {t('sharedView.ctaTitle')}
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              {t('sharedView.ctaDescription')}
            </p>
            <button
              onClick={onStartNewAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t('sharedView.startNewButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-3 md:py-4 text-center relative z-10 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <p className="text-[10px] md:text-xs text-slate-600 font-medium">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
};
