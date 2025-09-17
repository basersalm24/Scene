import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: <T = string>(key: string) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to safely get a nested property from an object
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState('en');
    const [messages, setMessages] = useState<Record<string, any> | null>(null);
    const [fallbackMessages, setFallbackMessages] = useState<Record<string, any> | null>(null);

    useEffect(() => {
        // Fetch the fallback English translations once on mount
        fetch('./locales/en.json')
            .then(res => res.json())
            .then(data => setFallbackMessages(data))
            .catch(err => console.error("Failed to load fallback English locale", err));
    }, []);

    useEffect(() => {
        // Fetch the selected locale when it changes or when fallback is loaded
        if (!fallbackMessages) return;

        fetch(`./locales/${locale}.json`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => setMessages(data))
            .catch(err => {
                console.error(`Failed to load locale "${locale}", using fallback.`, err);
                setMessages(fallbackMessages); // fallback to english if fetch fails
            });

        const direction = locale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
        document.documentElement.dir = direction;
    }, [locale, fallbackMessages]);

    const t = <T = string>(key: string): T => {
        // Try to get the translation from the current locale's messages
        const value = messages ? getNestedValue(messages, key) : undefined;
        if (value !== undefined) {
            return value as T;
        }
        
        // If not found, fallback to English
        const fallbackValue = fallbackMessages ? getNestedValue(fallbackMessages, key) : undefined;
        if (fallbackValue !== undefined) {
            return fallbackValue as T;
        }

        // As a last resort, return the key itself and log a warning
        console.warn(`Translation not found for key: ${key}`);
        return key as T;
    };
    
    // To prevent a flash of untranslated content, don't render children until the essential fallback messages are loaded.
    if (!fallbackMessages) {
        return null; 
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslations = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslations must be used within a LanguageProvider');
    }
    return context;
};