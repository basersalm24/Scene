import React from 'react';
import { AppMode } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface ModeSwitcherProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
    isProUser: boolean;
}

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const ProBadge: React.FC = () => {
    const { t } = useTranslations();
    return (
        <span className="text-xs font-bold text-indigo-300 bg-indigo-600/50 px-2 py-0.5 rounded-full ml-2">
            {t('proBadge.label')}
        </span>
    );
};

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange, isProUser }) => {
    const { t } = useTranslations();
    const modes = [
        { key: AppMode.GENERATE, label: t('mode.generate'), isPro: false },
        { key: AppMode.SEARCH, label: t('mode.search'), isPro: true },
        { key: AppMode.EDIT, label: t('mode.edit'), isPro: true },
        { key: AppMode.VIDEO, label: t('mode.video'), isPro: true },
    ];

    const baseClasses = "flex-1 text-center font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 flex items-center justify-center";
    const activeClasses = "bg-indigo-600 text-white shadow";
    const inactiveClasses = "bg-slate-900/50 text-slate-300 hover:bg-slate-800/70";
    
    return (
        <div className="w-full bg-slate-800/50 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            {modes.map(m => (
                <button
                    key={m.key}
                    onClick={() => onModeChange(m.key)}
                    className={`${baseClasses} ${mode === m.key ? activeClasses : inactiveClasses}`}
                    aria-pressed={mode === m.key}
                >
                    {m.label}
                    {m.isPro && (isProUser ? <ProBadge /> : <LockIcon />)}
                </button>
            ))}
        </div>
    );
};