import { QUOTES, Quote } from '@/constants/quotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_QUOTE = '@sleep_app_current_quote';
const STORAGE_KEY_USED = '@sleep_app_used_quotes';
const STORAGE_KEY_DATE = '@sleep_app_quote_date';

function getTodayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

export function useQuoteOfDay() {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const selectNewQuote = useCallback(async (): Promise<Quote> => {
        try {
            const usedRaw = await AsyncStorage.getItem(STORAGE_KEY_USED);
            let usedIds: number[] = usedRaw ? JSON.parse(usedRaw) : [];

            if (usedIds.length >= 30) {
                usedIds = usedIds.slice(-10);
            }

            const available = QUOTES.filter((q) => !usedIds.includes(q.id));
            const pool = available.length > 0 ? available : QUOTES;

            const randomIndex = Math.floor(Math.random() * pool.length);
            const selected = pool[randomIndex];

            usedIds.push(selected.id);
            await AsyncStorage.setItem(STORAGE_KEY_USED, JSON.stringify(usedIds));
            await AsyncStorage.setItem(STORAGE_KEY_QUOTE, JSON.stringify(selected));
            await AsyncStorage.setItem(STORAGE_KEY_DATE, getTodayKey());

            return selected;
        } catch (error) {
            console.log('[QuoteOfDay] Error selecting quote:', error);
            return QUOTES[0];
        }
    }, []);

    const loadQuote = useCallback(async () => {
        try {
            setIsLoading(true);
            const storedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
            const today = getTodayKey();

            if (storedDate === today) {
                const storedQuote = await AsyncStorage.getItem(STORAGE_KEY_QUOTE);
                if (storedQuote) {
                    setQuote(JSON.parse(storedQuote));
                    setIsLoading(false);
                    return;
                }
            }

            const newQuote = await selectNewQuote();
            setQuote(newQuote);
        } catch (error) {
            console.log('[QuoteOfDay] Error loading quote:', error);
            setQuote(QUOTES[0]);
        } finally {
            setIsLoading(false);
        }
    }, [selectNewQuote]);

    useEffect(() => {
        loadQuote();
    }, [loadQuote]);

    useEffect(() => {
        const checkMidnight = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                loadQuote();
            }
        }, 60000);

        return () => clearInterval(checkMidnight);
    }, [loadQuote]);

    return { quote, isLoading };
}
