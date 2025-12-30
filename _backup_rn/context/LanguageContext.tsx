import i18n from '@/constants/i18n';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

type LanguageContextType = {
    locale: string;
    setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cross-platform storage adapter
const storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                return window.localStorage.getItem(key);
            }
            return null;
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, value);
            }
            return;
        }
        await SecureStore.setItemAsync(key, value);
    }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState(i18n.locale);

    useEffect(() => {
        async function loadStoredLanguage() {
            try {
                const storedLang = await storage.getItem('user-language');
                if (storedLang) {
                    i18n.locale = storedLang;
                    setLocale(storedLang);
                } else {
                    const deviceLang = Localization.getLocales()[0].languageCode ?? 'en';
                    i18n.locale = deviceLang;
                    setLocale(deviceLang);
                }
            } catch (e) {
                console.error("Error loading language", e);
            }
        }
        loadStoredLanguage();
    }, []);

    const setLanguage = async (lang: string) => {
        i18n.locale = lang;
        setLocale(lang);
        try {
            await storage.setItem('user-language', lang);
        } catch (e) {
            console.error("Error saving language", e);
        }
    };

    return (
        <LanguageContext.Provider value={{ locale, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
