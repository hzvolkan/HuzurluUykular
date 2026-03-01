import Colors from '@/constants/colors';
import { Quote } from '@/constants/quotes';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { Quote as QuoteIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface QuoteCardProps {
    quote: Quote | null;
    isLoading: boolean;
}

export default React.memo(function QuoteCard({ quote, isLoading }: QuoteCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { language } = useLanguageStore();

    useEffect(() => {
        if (quote) {
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }).start();
        }
    }, [quote, fadeAnim]);

    if (isLoading || !quote) {
        return <View style={styles.container} />;
    }

    const text = typeof quote.text === 'string' ? quote.text : (quote.text?.[language] || quote.text?.tr);
    const author = typeof quote.author === 'string' ? quote.author : (quote.author?.[language] || quote.author?.tr);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]} testID="quote-card">
            <QuoteIcon color={Colors.accentSoft} size={20} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>{text}</Text>
            <Text style={styles.quoteAuthor}>— {author}</Text>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
    },
    quoteIcon: {
        marginBottom: 12,
        opacity: 0.6,
    },
    quoteText: {
        fontSize: 17,
        fontWeight: '300' as const,
        color: Colors.textPrimary,
        textAlign: 'center' as const,
        lineHeight: 26,
        letterSpacing: 0.3,
        fontStyle: 'italic' as const,
    },
    quoteAuthor: {
        fontSize: 13,
        color: Colors.textMuted,
        textAlign: 'center' as const,
        marginTop: 10,
        letterSpacing: 0.5,
    },
});
