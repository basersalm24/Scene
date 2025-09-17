import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
    const { t } = useTranslations();
    return (
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
                {t('header.title')}
            </h1>
            <p className="mt-2 text-slate-400 text-lg">{t('header.subtitle')}</p>
        </header>
    );
}