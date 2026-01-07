import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: 'zh' | 'en') => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = i18n.language?.startsWith('zh') ? 'zh' : 'en';
  const currentLangText = currentLang === 'zh' ? t('languageSwitcher.zh') : t('languageSwitcher.en');

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-800/50"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLangText}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-28 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => changeLanguage('zh')} 
            className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
              currentLang === 'zh' 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            中文
          </button>
          <button 
            onClick={() => changeLanguage('en')} 
            className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
              currentLang === 'en' 
                ? 'bg-blue-600/20 text-blue-400' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            English
          </button>
        </div>
      )}
    </div>
  );
};
