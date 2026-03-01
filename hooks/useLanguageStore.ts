import i18n from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Language = 'tr' | 'en';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'tr',
            setLanguage: (language) => {
                i18n.changeLanguage(language).catch(() => { });
                set({ language });
            },
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    i18n.changeLanguage(state.language).catch(() => { });
                }
            },
        }
    )
);
