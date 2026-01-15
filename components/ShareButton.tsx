import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ShareButtonProps {
  analysisResult: AnalysisResult;
  query: string;
  onShareClick: () => void;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  onShareClick,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      onShareClick();
    } finally {
      // Brief loading state for visual feedback
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      aria-label={t('share.button')}
      className={`
        text-xs md:text-sm text-slate-400 hover:text-white transition-colors 
        flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      <span className="hidden md:inline">{t('share.button')}</span>
    </button>
  );
};
