import QuoteCard from '@/components/QuoteCard';
import SleepTimer from '@/components/SleepTimer';
import SoundCard from '@/components/SoundCard';
import Colors from '@/constants/colors';
import { SOUNDS } from '@/constants/sounds';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuoteOfDay } from '@/hooks/useQuoteOfDay';
import { useSleep } from '@/providers/SleepProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SleepScreen() {
    const insets = useSafeAreaInsets();
    const { sounds, isPlaying, playAll, pauseAll, timerMinutes, timerSecondsLeft, isFadingOut, startTimer, cancelTimer } = useSleep();
    const { quote, isLoading } = useQuoteOfDay();
    const { language, setLanguage } = useLanguageStore();
    const { t } = useTranslation();

    // Reanimated Shared Values
    const fadeAnim = useSharedValue(0);
    const breatheAnim = useSharedValue(0.3);

    useEffect(() => {
        fadeAnim.value = withTiming(1, { duration: 1000 });
        breatheAnim.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 4000 }),
                withTiming(0.3, { duration: 4000 })
            ),
            -1, // Infinite loop
            true // reverse
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        flex: 1,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: breatheAnim.value,
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View style={[styles.glowEffect, glowStyle]} pointerEvents="none" />

            <Animated.View style={containerStyle}>
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.titleContainer}>
                        <Moon color={Colors.accent} size={28} strokeWidth={2.5} />
                        <View>
                            <Text style={styles.title}>{t('common.appTitle')}</Text>
                            <Text style={styles.subtitle}>{t('common.subtitle')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('common.sounds')}</Text>
                        <View style={styles.grid}>
                            {SOUNDS.map((sound) => {
                                const name = typeof sound.name === 'string' ? sound.name : sound.name[language] || sound.name.tr;
                                const desc = typeof sound.description === 'string' ? sound.description : sound.description[language] || sound.description.tr;

                                return (
                                    <View key={sound.id} style={styles.gridItem}>
                                        <SoundCard
                                            sound={sound}
                                            state={sounds[sound.id]}
                                            translatedName={name}
                                            translatedDescription={desc}
                                        />
                                    </View>
                                )
                            })}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <SleepTimer
                            timerMinutes={timerMinutes}
                            timerSecondsLeft={timerSecondsLeft}
                            isFadingOut={isFadingOut}
                            onStartTimer={startTimer}
                            onCancelTimer={cancelTimer}
                        />
                    </View>

                    <View style={[styles.section, styles.quoteSection]}>
                        <View style={styles.languageToggleContainer}>
                            <TouchableOpacity
                                onPress={() => setLanguage('en')}
                                style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                            >
                                <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setLanguage('tr')}
                                style={[styles.langButton, language === 'tr' && styles.langButtonActive]}
                            >
                                <Text style={[styles.langText, language === 'tr' && styles.langTextActive]}>TR</Text>
                            </TouchableOpacity>
                        </View>
                        <QuoteCard quote={quote} isLoading={isLoading} />
                    </View>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 {t('common.footer')} - volksdev</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    glowEffect: {
        position: 'absolute',
        top: '20%',
        left: '50%',
        width: 300,
        height: 300,
        marginLeft: -150,
        borderRadius: 150,
        backgroundColor: Colors.accent,
        filter: 'blur(80px)', // web
        zIndex: -1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.accent,
        opacity: 0.9,
        marginTop: 4,
        letterSpacing: 0.3,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    gridItem: {
        width: '50%',
        padding: 6,
    },
    quoteSection: {
        marginTop: 'auto',
        marginBottom: 40,
    },
    languageToggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 12,
    },
    langButton: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        backgroundColor: 'transparent',
    },
    langButtonActive: {
        backgroundColor: Colors.accentSoft,
        borderColor: Colors.accent,
    },
    langText: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    langTextActive: {
        color: Colors.gradientStart,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: Colors.textMuted,
        letterSpacing: 0.5,
    },
});
