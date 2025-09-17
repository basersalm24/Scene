import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { AppMode } from '../types';
import { useTranslations } from '../contexts/LanguageContext';

interface ActionButtonProps {
    isLoading: boolean;
    onClick: () => void;
    mode: AppMode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ isLoading, onClick, mode }) => {
    const { t } = useTranslations();
    
    const getButtonText = () => {
        switch (mode) {
            case AppMode.GENERATE: return t('button.generate');
            case AppMode.EDIT: return t('button.edit');
            case AppMode.VIDEO: return t('button.video');
            default: return t('button.generate');
        }
    }
    
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 shadow-lg"
        >
            {isLoading ? (
                <>
                    <LoadingIndicator />
                    <span className="ms-2">{t('button.processing')}</span>
                </>
            ) : (
                getButtonText()
            )}
        </button>
    );
};