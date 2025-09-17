import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

interface SubscriptionManagerProps {
    isPro: boolean;
    onManageSubscription: () => void;
}

const ProIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ isPro, onManageSubscription }) => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col items-start text-sm">
            <div className="flex items-center gap-2">
                {isPro && <ProIcon />}
                <span className="font-semibold text-slate-300">
                    {isPro ? t('subscription.status.pro') : t('subscription.status.free')}
                </span>
            </div>
            {isPro && (
                <button 
                    onClick={onManageSubscription}
                    className="mt-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors underline"
                >
                    {t('subscription.manage')}
                </button>
            )}
        </div>
    );
};
