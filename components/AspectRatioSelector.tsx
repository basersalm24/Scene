import React from 'react';
import { AspectRatio } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface AspectRatioSelectorProps {
    selectedRatio: AspectRatio;
    onRatioChange: (ratio: AspectRatio) => void;
}

const ratios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
    const { t } = useTranslations();

    const baseClasses = "flex-grow text-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500";
    const activeClasses = "bg-slate-700 text-white";
    const inactiveClasses = "bg-slate-900/50 text-slate-400 hover:bg-slate-800";

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('aspectRatio.title')}
            </label>
            <div className="flex items-center gap-2">
                {ratios.map(ratio => (
                    <button
                        key={ratio}
                        onClick={() => onRatioChange(ratio)}
                        className={`${baseClasses} ${selectedRatio === ratio ? activeClasses : inactiveClasses}`}
                        aria-pressed={selectedRatio === ratio}
                    >
                        {ratio}
                    </button>
                ))}
            </div>
        </div>
    );
};