import React, { useState, useCallback, useEffect } from 'react';
import { AppMode, AspectRatio, HistoryItem, GroundingSource } from './types';
import { useTranslations } from './contexts/LanguageContext';
import { useToast } from './contexts/ToastContext';
import { generateImage, editImage, generateVideo, enhancePrompt, generateRandomPrompt, generateImageWithSearch } from './services/geminiService';
import { Header } from './components/Header';
import { ModeSwitcher } from './components/ModeSwitcher';
import { PromptInput } from './components/PromptInput';
import { ImageUploader } from './components/ImageUploader';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ActionButton } from './components/ActionButton';
import { ImageDisplay } from './components/ImageDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { History } from './components/History';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { UpgradeModal } from './components/UpgradeModal';
import { SubscriptionManager } from './components/SubscriptionManager';
import { StyleSelector, styles } from './components/StyleSelector';

// --- STRIPE CONFIGURATION ---
// In a real production environment, these should be set as environment variables.
// For this demo, we are using placeholder values as a fallback.
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY';
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_YOUR_PRICE_ID';

if (STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_PUBLISHABLE_KEY' || STRIPE_PRO_PRICE_ID === 'price_YOUR_PRICE_ID') {
    console.warn(
        "Stripe environment variables are not set. Using placeholder keys. " +
        "The Stripe integration is simulated and will not process real payments."
    );
}


// Custom hook to sync state with localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


const App: React.FC = () => {
    const { t } = useTranslations();
    const { showToast } = useToast();

    const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<string>('none');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [uploadedImage, setUploadedImage] = useState<{ file: File | null; preview: string | null; base64: string | null; mimeType: string | null }>({ file: null, preview: null, base64: null, mimeType: null });
    const [result, setResult] = useState<{ image?: string; video?: string; text?: string; groundingSources?: GroundingSource[] } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    const [isGeneratingRandom, setIsGeneratingRandom] = useState<boolean>(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

    const [history, setHistory] = useLocalStorage<HistoryItem[]>('generationHistory', []);
    const [subscriptionStatus, setSubscriptionStatus] = useLocalStorage<'free' | 'pro'>('subscriptionStatus', 'free');
    
    const isProUser = subscriptionStatus === 'pro';

     // Effect to handle redirect from Stripe Checkout
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('payment_success')) {
            showToast('Upgrade successful! Welcome to Pro.', 'success');
            setSubscriptionStatus('pro');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        if (query.get('payment_canceled')) {
            showToast('Your payment was canceled. You can try again anytime.', 'info');
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [setSubscriptionStatus, showToast]);

    // Effect to clean up video blob URLs to prevent memory leaks
    useEffect(() => {
        // This cleanup function is returned by the effect. It runs when the component
        // unmounts or when the 'result' dependency changes before the effect runs again.
        return () => {
            if (result?.video && result.video.startsWith('blob:')) {
                URL.revokeObjectURL(result.video);
            }
        };
    }, [result]);


    const handleImageRemove = useCallback(() => {
        if (uploadedImage.preview && uploadedImage.preview.startsWith('blob:')) {
            URL.revokeObjectURL(uploadedImage.preview);
        }
        setUploadedImage({ file: null, preview: null, base64: null, mimeType: null });
    }, [uploadedImage.preview]);

    const handleImageUpload = useCallback(async (file: File) => {
        handleImageRemove(); // Clean up previous preview
        const base64 = await fileToBase64(file);
        setUploadedImage({ file, preview: URL.createObjectURL(file), base64, mimeType: file.type });
    }, [handleImageRemove]);

    const handleModeChange = useCallback((newMode: AppMode) => {
        const isProFeature = newMode === AppMode.EDIT || newMode === AppMode.VIDEO || newMode === AppMode.SEARCH;
        if (isProFeature && !isProUser) {
            setIsUpgradeModalOpen(true);
            return;
        }

        setMode(newMode);
        setError(null);
        setResult(null);
        if (newMode === AppMode.GENERATE || newMode === AppMode.SEARCH) {
            handleImageRemove();
        }
    }, [isProUser, handleImageRemove]);
    
    const handleStyleChange = (styleId: string) => {
        if (!isProUser && styleId !== 'none') {
            setIsUpgradeModalOpen(true);
            return;
        }
        setSelectedStyle(styleId);
    };
    
    const redirectToCheckout = async () => {
        setIsLoading(true);
        setError(null);
        
        // --- SIMULATED BACKEND INTERACTION ---
        try {
            console.log("Step 1: Client requests to create a checkout session.");
            
            // Simulate calling our backend. In a real app, this would be a fetch() request.
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Step 2: Simulated backend received request.");

            // In a real backend, you'd create a Stripe session and return its URL.
            // Here, we simulate the user completing or canceling the payment on that page.
            console.log("Step 3: Redirecting to mock Stripe page. Please confirm or cancel the payment.");
            
            const wasSuccessful = window.confirm(
                "--- MOCK STRIPE CHECKOUT ---\n\n" +
                "You are now on the Stripe payment page.\n\n" +
                "Click 'OK' to simulate a successful payment.\n" +
                "Click 'Cancel' to simulate a canceled payment."
            );

            // Step 4: Stripe redirects the user back to our application with a status.
            if (wasSuccessful) {
                window.location.href = `${window.location.origin}?payment_success=true`;
            } else {
                window.location.href = `${window.location.origin}?payment_canceled=true`;
            }

        } catch (e: any) {
            setError(e.message || "Failed to simulate checkout session.");
            setIsLoading(false);
        }
    };

    const redirectToCustomerPortal = async () => {
        alert(t('stripe.portalRedirectNotice'));
        console.log("--- SIMULATING STRIPE CUSTOMER PORTAL ---");
        // In a real app, this would make a request to your backend to create
        // a customer portal session and then redirect to the returned URL.
    };


    const handleAction = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        setResult(null);

        const newHistoryItem: Omit<HistoryItem, 'id' | 'timestamp' | 'outputVideo'> & { outputVideo?: string } = {
            mode,
            prompt,
            negativePrompt: mode === AppMode.GENERATE ? negativePrompt : undefined,
            aspectRatio: mode === AppMode.GENERATE ? aspectRatio : undefined,
            inputImage: uploadedImage.base64 ?? undefined,
            inputImageMimeType: uploadedImage.mimeType ?? undefined,
        };

        try {
            let actionResult: { image?: string | null; video?: string | null; text?: string | null; groundingSources?: GroundingSource[] } = {};

            if (mode === AppMode.GENERATE) {
                if (!prompt) throw new Error(t('app.errors.noPrompt'));
                setLoadingMessage(t('app.loading.generatingImage'));
                
                const style = styles.find(s => s.id === selectedStyle);
                const finalPrompt = style && style.id !== 'none' ? `${prompt}, ${style.keywords}` : prompt;

                const generatedImage = await generateImage(finalPrompt, aspectRatio, negativePrompt);
                actionResult = { image: generatedImage };
            } else if (mode === AppMode.SEARCH) {
                if (!prompt) throw new Error(t('app.errors.noPrompt'));
                if (!isProUser) throw new Error(t('app.errors.proRequired'));
                setLoadingMessage(t('app.loading.searching'));
                const { imageUrl, sources } = await generateImageWithSearch(prompt);
                actionResult = { image: imageUrl, groundingSources: sources };
                newHistoryItem.groundingSources = sources;
            } else if (mode === AppMode.EDIT) {
                if (!isProUser) throw new Error(t('app.errors.proRequired'));
                if (!uploadedImage.base64 || !uploadedImage.mimeType) throw new Error(t('app.errors.noImageToEdit'));
                if (!prompt) throw new Error(t('app.errors.noPromptForEdit'));
                setLoadingMessage(t('app.loading.editingImage'));
                const { imageUrl, text } = await editImage(prompt, uploadedImage.base64, uploadedImage.mimeType);
                actionResult = { image: imageUrl, text };
            } else if (mode === AppMode.VIDEO) {
                if (!isProUser) throw new Error(t('app.errors.proRequired'));
                if (!prompt && !uploadedImage.base64) throw new Error(t('app.errors.noInputForVideo'));
                setLoadingMessage(t('app.loading.generatingVideo'));
                let imagePayload;
                if (uploadedImage.base64 && uploadedImage.mimeType) {
                    imagePayload = { base64ImageData: uploadedImage.base64, mimeType: uploadedImage.mimeType };
                }
                const videoUrl = await generateVideo(prompt, imagePayload);

                const response = await fetch(`${videoUrl}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch generated video file.');
                }
                const videoBlob = await response.blob();
                const blobUrl = URL.createObjectURL(videoBlob);
                actionResult = { video: blobUrl };
                newHistoryItem.outputVideo = videoUrl; // Save the original API URL for re-fetching
            }

            setResult(actionResult);

            const finalHistoryItem: HistoryItem = {
                ...newHistoryItem,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                outputImage: actionResult.image ?? undefined,
                outputText: actionResult.text ?? undefined,
                outputVideo: newHistoryItem.outputVideo,
                groundingSources: newHistoryItem.groundingSources,
            };
            setHistory(prev => [finalHistoryItem, ...prev].slice(0, 50));
            showToast(t('toast.generationSuccess'), 'success');
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (e: any) {
            setError(e.message || t('app.errors.generic'));
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [mode, prompt, negativePrompt, aspectRatio, uploadedImage, t, setHistory, isProUser, selectedStyle, showToast]);

    const handleEnhancePrompt = useCallback(async () => {
        if (!prompt) return;
        setIsEnhancing(true);
        setError(null);
        try {
            const enhanced = await enhancePrompt(prompt);
            setPrompt(enhanced);
        } catch (e: any) {
            setError(e.message || t('app.errors.enhanceFailed'));
        } finally {
            setIsEnhancing(false);
        }
    }, [prompt, t]);

    const handleSurpriseMe = useCallback(async () => {
        setIsGeneratingRandom(true);
        setError(null);
        try {
            const randomPrompt = await generateRandomPrompt();
            setPrompt(randomPrompt);
        } catch (e: any) {
            setError(e.message || t('app.errors.surpriseMeFailed'));
        } finally {
            setIsGeneratingRandom(false);
        }
    }, [t]);
    
    const handleHistoryRestore = useCallback(async (item: HistoryItem) => {
        setError(null);
        setIsLoading(true);
        setLoadingMessage(t('app.loading.restoringHistory'));

        try {
            // Restore inputs
            setMode(item.mode);
            setPrompt(item.prompt);
            setNegativePrompt(item.negativePrompt || '');
            if (item.aspectRatio) setAspectRatio(item.aspectRatio);
            
            // Restore input image from base64 data
            if (item.inputImage && item.inputImageMimeType) {
                const dataUrl = `data:${item.inputImageMimeType};base64,${item.inputImage}`;
                setUploadedImage({
                    file: null, // Original file object is lost on reload
                    preview: dataUrl,
                    base64: item.inputImage,
                    mimeType: item.inputImageMimeType,
                });
            } else {
                handleImageRemove();
            }

            // Restore output
            let restoredResult: { image?: string; video?: string; text?: string; groundingSources?: GroundingSource[] } = {
                image: item.outputImage,
                text: item.outputText,
                groundingSources: item.groundingSources,
            };

            // If it's a video, we need to re-fetch it from the original URL
            if (item.outputVideo) {
                const response = await fetch(`${item.outputVideo}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch video from history.');
                }
                const videoBlob = await response.blob();
                const blobUrl = URL.createObjectURL(videoBlob);
                restoredResult.video = blobUrl;
            }

            setResult(restoredResult);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (e: any) {
            setError(e.message || t('app.errors.generic'));
            setResult(null);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [handleImageRemove, t]);

    const handleHistoryDelete = useCallback((id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    }, [setHistory]);

    const handleHistoryClear = useCallback(() => {
        if (window.confirm(t('history.clearConfirm'))) {
            setHistory([]);
            showToast(t('toast.historyCleared'), 'success');
        }
    }, [setHistory, t, showToast]);


    return (
        <div className="bg-slate-900 min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-48 flex justify-start">
                         <SubscriptionManager 
                            isPro={isProUser} 
                            onManageSubscription={redirectToCustomerPortal}
                         />
                    </div>
                    <Header />
                    <div className="w-48 flex justify-end">
                      <LanguageSwitcher />
                    </div>
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="flex flex-col gap-6">
                        <ModeSwitcher mode={mode} onModeChange={handleModeChange} isProUser={isProUser} />
                        
                        <PromptInput
                            prompt={prompt}
                            onPromptChange={setPrompt}
                            placeholder={t(`prompt.placeholder.${mode.toLowerCase()}`)}
                            onEnhance={handleEnhancePrompt}
                            isEnhancing={isEnhancing}
                            onSurpriseMe={handleSurpriseMe}
                            isGeneratingRandom={isGeneratingRandom}
                        />

                        {mode === AppMode.GENERATE && (
                            <div>
                                <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('negativePrompt.label')}
                                </label>
                                <textarea
                                    id="negative-prompt"
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder={t('negativePrompt.placeholder')}
                                    rows={2}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
                                />
                            </div>
                        )}

                        {(mode === AppMode.EDIT || mode === AppMode.VIDEO) && (
                            <ImageUploader
                                onImageUpload={handleImageUpload}
                                onImageRemove={handleImageRemove}
                                uploadedImagePreview={uploadedImage.preview}
                                label={mode === AppMode.EDIT ? t('uploader.label.edit') : t('uploader.label.video')}
                            />
                        )}

                        {mode === AppMode.GENERATE && (
                            <>
                                <StyleSelector
                                    selectedStyle={selectedStyle}
                                    onStyleChange={handleStyleChange}
                                    isProUser={isProUser}
                                />
                                <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} />
                            </>
                        )}

                        <ActionButton isLoading={isLoading} onClick={handleAction} mode={mode} />
                        
                        {error && <ErrorDisplay message={error} />}
                    </div>

                    <div className="flex flex-col gap-8">
                        <ImageDisplay result={result} isLoading={isLoading} loadingMessage={loadingMessage} prompt={prompt} />
                        <History 
                            items={history}
                            onRestore={handleHistoryRestore}
                            onClear={handleHistoryClear}
                            onDelete={handleHistoryDelete}
                        />
                    </div>
                </main>
            </div>
            <UpgradeModal 
                isOpen={isUpgradeModalOpen} 
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgrade={redirectToCheckout}
            />
        </div>
    );
};

export default App;