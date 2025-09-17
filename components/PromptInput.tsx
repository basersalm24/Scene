import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';
import { LoadingIndicator } from './LoadingIndicator';

interface PromptInputProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    placeholder: string;
    onEnhance: () => void;
    isEnhancing: boolean;
    onSurpriseMe: () => void;
    isGeneratingRandom: boolean;
}

const EnhanceIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const SurpriseMeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" transform="rotate(90 12 12) translate(0 2)" />
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    </svg>
);

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onPromptChange, placeholder, onEnhance, isEnhancing, onSurpriseMe, isGeneratingRandom }) => {
    const { t } = useTranslations();
    return (
        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                {t('prompt.label')}
            </label>
            <div className="relative">
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 pr-24 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                        onClick={onSurpriseMe}
                        disabled={isGeneratingRandom || isEnhancing}
                        className="p-2 text-slate-400 bg-slate-900/70 rounded-md hover:text-white hover:bg-slate-800/90 disabled:cursor-not-allowed disabled:text-slate-600 transition-colors"
                        aria-label={t('prompt.surpriseMeAriaLabel')}
                        title={t('prompt.surpriseMeAriaLabel')}
                    >
                        {isGeneratingRandom ? <LoadingIndicator size="sm" /> : <SurpriseMeIcon />}
                    </button>
                    <button
                        onClick={onEnhance}
                        disabled={isEnhancing || isGeneratingRandom || !prompt}
                        className="p-2 text-slate-400 bg-slate-900/70 rounded-md hover:text-white hover:bg-slate-800/90 disabled:cursor-not-allowed disabled:text-slate-600 transition-colors"
                        aria-label={t('prompt.enhanceAriaLabel')}
                        title={t('prompt.enhanceAriaLabel')}
                    >
                        {isEnhancing ? <LoadingIndicator size="sm" /> : <EnhanceIcon />}
                    </button>
                </div>
            </div>
        </div>
    );
}