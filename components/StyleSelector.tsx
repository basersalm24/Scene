import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

interface StyleSelectorProps {
    selectedStyle: string;
    onStyleChange: (styleId: string) => void;
    isProUser: boolean;
}

interface Style {
    id: string;
    keywords: string;
}

export const styles: Style[] = [
    { id: 'none', keywords: '' },
    { id: 'photorealistic', keywords: 'photorealistic, 8k, detailed, professional photography' },
    { id: 'fantasy', keywords: 'fantasy art, detailed, epic, concept art, matte painting' },
    { id: 'anime', keywords: 'anime style, key visual, vibrant, studio ghibli inspired' },
    { id: 'cyberpunk', keywords: 'cyberpunk, neon lighting, futuristic, dystopian, high-tech' },
];

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1.5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);


export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange, isProUser }) => {
    const { t } = useTranslations();

    const baseClasses = "flex-shrink-0 text-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 flex items-center justify-center";
    const activeClasses = "bg-slate-700 text-white";
    const inactiveClasses = "bg-slate-900/50 text-slate-400 hover:bg-slate-800";

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('styleSelector.title')}
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {styles.map(style => {
                    const isProStyle = style.id !== 'none';
                    return (
                        <button
                            key={style.id}
                            onClick={() => onStyleChange(style.id)}
                            className={`${baseClasses} ${selectedStyle === style.id ? activeClasses : inactiveClasses}`}
                            aria-pressed={selectedStyle === style.id}
                        >
                            {t(`styles.${style.id}`)}
                            {isProStyle && !isProUser && <LockIcon />}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};