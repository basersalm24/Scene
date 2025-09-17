import React, { useState } from 'react';
import { HistoryItem, AppMode } from '../types';
import { useTranslations } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface HistoryProps {
    items: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onClear: () => void;
    onDelete: (id: string) => void;
}

const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export const History: React.FC<HistoryProps> = ({ items, onRestore, onClear, onDelete }) => {
    const { t } = useTranslations();
    const { showToast } = useToast();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (items.length === 0) {
        return null;
    }
    
    const getModeLabel = (mode: AppMode) => {
        switch (mode) {
            case AppMode.GENERATE: return t('mode.generate');
            case AppMode.EDIT: return t('mode.edit');
            case AppMode.VIDEO: return t('mode.video');
            default: return '';
        }
    }

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDelete(id);
    }
    
    const handleCopyPrompt = (e: React.MouseEvent, prompt: string, id: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt).then(() => {
            setCopiedId(id);
            showToast(t('toast.promptCopied'), 'success');
            setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    return (
        <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-200">{t('history.title')}</h2>
                {items.length > 0 && (
                     <button 
                        onClick={onClear} 
                        className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                        {t('history.clear')}
                    </button>
                )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onRestore(item)}
                        className="group flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors relative"
                    >
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-800 rounded-md overflow-hidden flex items-center justify-center">
                            {item.outputImage && <img src={`data:image/png;base64,${item.outputImage}`} alt="History item" className="w-full h-full object-cover" />}
                            {item.outputVideo && <div className="text-slate-500 text-xs text-center p-1">{t('history.videoOutput')}</div>}
                             {!item.outputImage && !item.outputVideo && item.inputImage && <img src={item.inputImage} alt="History input" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-600/50 text-indigo-300">
                                    {getModeLabel(item.mode)}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-sm text-slate-300 truncate flex-grow" title={item.prompt}>
                                    {item.prompt || <em>No prompt provided</em>}
                                </p>
                                <button
                                    onClick={(e) => handleCopyPrompt(e, item.prompt, item.id)}
                                    className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
                                    aria-label={t('history.copyPromptAriaLabel')}
                                    disabled={!item.prompt}
                                >
                                    {copiedId === item.id ? <CheckIcon /> : <CopyIcon />}
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleDelete(e, item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-slate-700/50 text-slate-300 rounded-full opacity-0 group-hover:opacity-100 hover:bg-slate-600/80 transition-opacity"
                            aria-label={t('history.deleteAriaLabel')}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};