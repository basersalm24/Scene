import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { useTranslations } from '../contexts/LanguageContext';
import { GroundingSource } from '../types';

interface ImageDisplayProps {
    result: {
        image?: string;
        video?: string;
        text?: string;
        groundingSources?: GroundingSource[];
    } | null;
    isLoading: boolean;
    loadingMessage?: string;
    prompt?: string;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const GlobeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-2 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.707-.707a2 2 0 012.828 0l.707.707M12 21a9 9 0 110-18 9 9 0 010 18z" />
    </svg>
);


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ result, isLoading, loadingMessage, prompt }) => {
    const { t } = useTranslations();

    const handleDownload = () => {
        if (!result) return;
        const link = document.createElement('a');
        let fileSrc: string | undefined;
        let fileExtension: string;

        if (result.image) {
            fileSrc = `data:image/png;base64,${result.image}`;
            fileExtension = 'png';
        } else if (result.video) {
            fileSrc = result.video;
            fileExtension = 'mp4';
        } else {
            return;
        }

        link.href = fileSrc;
        const safePrompt = prompt ? prompt.substring(0, 40).replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'scene';
        link.download = `${safePrompt}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center">
                    <LoadingIndicator size="lg" />
                    <p className="mt-4 text-slate-400">{loadingMessage || t('display.loading')}</p>
                </div>
            );
        }

        if (!result || (!result.image && !result.video && !result.text)) {
            return (
                <div className="text-center text-slate-500">
                    <p>{t('display.placeholder')}</p>
                </div>
            );
        }
        
        const hasMedia = result.image || result.video;

        return (
            <div className="relative w-full h-full flex flex-col items-center justify-center group animate-fade-in">
                <div className="space-y-4 text-center">
                    {result.image && (
                        <img
                            src={`data:image/png;base64,${result.image}`}
                            alt={prompt || t('display.alt.generated')}
                            className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                        />
                    )}
                    {result.video && (
                        <video
                            src={result.video}
                            controls
                            autoPlay
                            loop
                            className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                        />
                    )}
                    {result.text && (
                        <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700 max-w-md mx-auto">{result.text}</p>
                    )}
                    {result.groundingSources && result.groundingSources.length > 0 && (
                        <div className="w-full max-w-md mx-auto text-left mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('display.sourcesTitle')}</h4>
                            <ul className="space-y-1">
                                {result.groundingSources.map((source, index) => (
                                    <li key={index} className="truncate">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-indigo-400 hover:underline">
                                            <GlobeIcon />
                                            <span className="truncate" title={source.title}>{source.title || new URL(source.uri).hostname}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                 {hasMedia && (
                    <button
                        onClick={handleDownload}
                        className="absolute top-3 right-3 p-2 bg-slate-800/70 text-white rounded-full hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-opacity opacity-0 group-hover:opacity-100 duration-200"
                        aria-label={t('display.downloadAriaLabel')}
                    >
                        <DownloadIcon />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            {renderContent()}
        </div>
    );
};