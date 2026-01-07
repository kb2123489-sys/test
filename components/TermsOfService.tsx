import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const sections = [
    { title: t('terms.section1Title'), content: t('terms.section1Content') },
    { title: t('terms.section2Title'), content: t('terms.section2Content') },
    { title: t('terms.section3Title'), content: t('terms.section3Content') },
    { title: t('terms.section4Title'), content: t('terms.section4Content') },
    { title: t('terms.section5Title'), content: t('terms.section5Content') },
    { title: t('terms.section6Title'), content: t('terms.section6Content') },
    { title: t('terms.section7Title'), content: t('terms.section7Content') },
    { title: t('terms.section8Title'), content: t('terms.section8Content') },
  ];

  // 渲染带有 **bold** 标记的文本
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (line.trim() === '') return <br key={lineIdx} />;
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIdx} className="mb-2 last:mb-0">
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>;
            }
            // 处理列表项
            if (part.startsWith('- ')) {
              return <span key={partIdx} className="block ml-4">{part}</span>;
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-16 max-w-4xl">
        {/* 返回按钮 */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('terms.backToHome')}</span>
        </button>

        {/* 标题区域 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('terms.title')}</h1>
          </div>
          <p className="text-slate-500 text-sm">{t('terms.lastUpdated')}</p>
        </div>

        {/* 简介 */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 mb-8">
          <p className="text-slate-300 leading-relaxed">{t('terms.intro')}</p>
        </div>

        {/* 各章节 */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">{section.title}</h2>
              <div className="text-slate-400 leading-relaxed">
                {renderContent(section.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
