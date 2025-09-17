import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    const { t } = useTranslations();

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-8 border border-slate-700 relative transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    aria-label={t('modal.closeAriaLabel')}
                >
                    <CloseIcon />
                </button>

                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293c.63.63 1.707.63 2.337 0L21 3m-4 18v-4m2 2h-4m-1-11a5.002 5.002 0 00-4.473 2.767l-2.293-2.293c-.63-.63-1.707-.63-2.337 0L3 9m18 4a5.002 5.002 0 00-2.767-4.473l-2.293 2.293c-.63.63-.63 1.707 0 2.337L21 15" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-white">
                        {t('upgradeModal.title')}
                    </h3>
                    <p className="mt-2 text-slate-400">
                        {t('upgradeModal.description')}
                    </p>
                    
                    <button 
                        onClick={onUpgrade}
                        className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    >
                        {t('upgradeModal.cta')}
                    </button>
                </div>
            </div>
        </div>
    );
};