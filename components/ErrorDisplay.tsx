import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    const { t } = useTranslations();
    return (
        <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-center">
            <p className="font-semibold">{t('error.title')}</p>
            <p className="text-sm mt-1">{message}</p>
        </div>
    );
}