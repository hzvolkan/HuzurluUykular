import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, CloudRain, Flame, Moon, Music, Timer } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_KEY = '@sleep_app_onboarding_done';

interface OnboardingPage {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accent: string;
    particles: { x: number; y: number; size: number; delay: number }[];
}

const PAGES: OnboardingPage[] = [
    {
        title: 'Huzurlu Uykular',
        subtitle: 'Doğanın sesleriyle derin bir uykuya dalın.\nZihninizi sakinleştirin, bedeninizi dinlendirin.',
        icon: <Moon color="#C49B68" size={48} strokeWidth={1.5} />,
        accent: '#C49B68',
        particles: [
            { x: 0.15, y: 0.2, size: 3, delay: 0 },
            { x: 0.8, y: 0.15, size: 2, delay: 400 },
            { x: 0.6, y: 0.35, size: 4, delay: 800 },
            { x: 0.25, y: 0.4, size: 2, delay: 200 },
            { x: 0.9, y: 0.3, size: 3, delay: 600 },
        ],
    },
    {
        title: 'Üç Huzur Katmanı',
        subtitle: 'Şömine sıcaklığı, yağmur damlaları ve\nyumuşak melodiler — hepsini bir arada.',
        icon: (
            <View style={{ flexDirection: 'row', gap: 16 }}>
                <Flame color="#E8A862" size={36} strokeWidth={1.5} />
                <CloudRain color="#8BB5D0" size={36} strokeWidth={1.5} />
                <Music color="#B89BD4" size={36} strokeWidth={1.5} />
            </View>
        ),
        accent: '#8BB5D0',
        particles: [
            { x: 0.1, y: 0.25, size: 2, delay: 100 },
            { x: 0.85, y: 0.2, size: 3, delay: 500 },
            { x: 0.5, y: 0.38, size: 2, delay: 300 },
            { x: 0.7, y: 0.12, size: 4, delay: 700 },
            { x: 0.3, y: 0.32, size: 3, delay: 900 },
        ],
    },
    {
        title: 'Uyku Zamanlayıcı',
        subtitle: 'Süreyi seçin, arkanıza yaslanın.\nSesler yavaşça kısılarak sizi uykuya bırakır.',
        icon: <Timer color="#7BAF6E" size={48} strokeWidth={1.5} />,
        accent: '#7BAF6E',
        particles: [
            { x: 0.2, y: 0.18, size: 3, delay: 200 },
            { x: 0.75, y: 0.28, size: 2, delay: 600 },
            { x: 0.4, y: 0.4, size: 4, delay: 0 },
            { x: 0.9, y: 0.15, size: 2, delay: 400 },
            { x: 0.1, y: 0.35, size: 3, delay: 800 },
        ],
    },
];

function FloatingParticle({ x, y, size, delay, accent }: {
    x: number;
    y: number;
    size: number;
    delay: number;
    accent: string;
}) {
    const anim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: 1,
                        duration: 3000 + Math.random() * 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 3000 + Math.random() * 2000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        }, delay);

        return () => clearTimeout(timeout);
    }, [anim, floatAnim, delay]);

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12],
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: x * SCREEN_WIDTH,
                top: y * SCREEN_HEIGHT,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: accent,
                opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.4],
                }),
                transform: [{ translateY }],
            }}
        />
    );
}

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentPage, setCurrentPage] = useState(0);
    const [splashDone, setSplashDone] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef<Animated.FlatList>(null);
    const fadeAnims = useRef(PAGES.map(() => new Animated.Value(0))).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const splashOpacity = useRef(new Animated.Value(1)).current;
    const splashLogoScale = useRef(new Animated.Value(0.6)).current;
    const splashLogoOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(splashLogoOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(splashLogoScale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
                tension: 40,
            }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(splashOpacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setSplashDone(true);
            });

            Animated.timing(fadeAnims[0], {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnims, splashOpacity, splashLogoScale, splashLogoOpacity, contentOpacity]);

    const animatePageIn = useCallback((index: number) => {
        fadeAnims.forEach((anim, i) => {
            Animated.timing(anim, {
                toValue: i === index ? 1 : 0,
                duration: 400,
                useNativeDriver: true,
            }).start();
        });
    }, [fadeAnims]);

    const completeOnboarding = useCallback(async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch (e) {
            console.log('[Onboarding] Failed to save:', e);
        }
        router.replace('/');
    }, [router]);

    const handleNext = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
            Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
        ]).start();

        if (currentPage < PAGES.length - 1) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            animatePageIn(nextPage);
            (scrollRef.current as any)?.scrollToOffset({
                offset: nextPage * SCREEN_WIDTH,
                animated: true,
            });
        } else {
            completeOnboarding();
        }
    }, [currentPage, buttonScale, animatePageIn, completeOnboarding]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        completeOnboarding();
    }, [completeOnboarding]);

    const onMomentumScrollEnd = useCallback((e: any) => {
        const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (pageIndex !== currentPage) {
            setCurrentPage(pageIndex);
            animatePageIn(pageIndex);
        }
    }, [currentPage, animatePageIn]);

    const isLastPage = currentPage === PAGES.length - 1;

    const renderPage = useCallback(({ item, index }: { item: OnboardingPage; index: number }) => {
        return (
            <View style={[styles.page, { width: SCREEN_WIDTH }]}>
                <View style={styles.particlesContainer}>
                    {item.particles.map((p, i) => (
                        <FloatingParticle
                            key={i}
                            x={p.x}
                            y={p.y}
                            size={p.size}
                            delay={p.delay}
                            accent={item.accent}
                        />
                    ))}
                </View>

                <View style={styles.pageContent}>
                    <View style={[styles.iconOrb, { shadowColor: item.accent }]}>
                        <View style={[styles.iconOrbInner, { borderColor: item.accent + '20' }]}>
                            {item.icon}
                        </View>
                    </View>

                    <Text style={styles.pageTitle}>{item.title}</Text>
                    <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
                </View>
            </View>
        );
    }, []);

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#1A110D', '#120C08', '#0D0907']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {!splashDone && (
                <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity }]} pointerEvents={splashDone ? 'none' : 'auto'}>
                    <LinearGradient
                        colors={['#1A110D', '#120C08', '#0D0907']}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFill}
                    />
                    <Animated.View style={[
                        styles.splashContent,
                        { opacity: splashLogoOpacity, transform: [{ scale: splashLogoScale }] },
                    ]}>
                        <View style={styles.splashIconOrb}>
                            <Moon color="#C49B68" size={56} strokeWidth={1.2} />
                        </View>
                        <Text style={styles.splashTitle}>Huzurlu Uykular</Text>
                        <View style={styles.splashDivider} />
                        <Text style={styles.splashTagline}>MURAT BABADAN KALİTELİ UYKULAR</Text>
                    </Animated.View>
                </Animated.View>
            )}

            <Animated.View style={[styles.mainContent, { opacity: contentOpacity }]}>
                <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
                    {!isLastPage ? (
                        <TouchableOpacity
                            onPress={handleSkip}
                            style={styles.skipButton}
                            activeOpacity={0.7}
                            testID="onboarding-skip"
                        >
                            <Text style={styles.skipText}>Geç</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.skipButton} />
                    )}
                </View>

                <Animated.FlatList
                    ref={scrollRef as any}
                    data={PAGES}
                    renderItem={renderPage}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false },
                    )}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    scrollEventThrottle={16}
                    getItemLayout={(_, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                />

                <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={styles.dots}>
                        {PAGES.map((_, i) => {
                            const inputRange = [
                                (i - 1) * SCREEN_WIDTH,
                                i * SCREEN_WIDTH,
                                (i + 1) * SCREEN_WIDTH,
                            ];
                            const dotWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [6, 24, 6],
                                extrapolate: 'clamp',
                            });
                            const dotOpacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.3, 1, 0.3],
                                extrapolate: 'clamp',
                            });
                            return (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        {
                                            width: dotWidth,
                                            opacity: dotOpacity,
                                            backgroundColor: PAGES[currentPage].accent,
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                { backgroundColor: PAGES[currentPage].accent + '20', borderColor: PAGES[currentPage].accent + '40' },
                            ]}
                            onPress={handleNext}
                            activeOpacity={0.8}
                            testID="onboarding-next"
                        >
                            <Text style={[styles.nextButtonText, { color: Colors.textPrimary }]}>
                                {isLastPage ? 'Başlayalım' : 'Devam'}
                            </Text>
                            <ChevronRight color={Colors.textPrimary} size={18} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    splashOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashContent: {
        alignItems: 'center',
        gap: 20,
    },
    splashIconOrb: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(42, 28, 20, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(196, 155, 104, 0.15)',
        shadowColor: '#C49B68',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 10,
        marginBottom: 8,
    },
    splashTitle: {
        fontSize: 32,
        fontWeight: '200' as const,
        color: Colors.accent,
        letterSpacing: 2,
    },
    splashDivider: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(196, 155, 104, 0.3)',
        marginVertical: 14,
    },
    splashTagline: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: 'rgba(196, 155, 104, 0.5)',
        letterSpacing: 3,
        textAlign: 'center' as const,
    },
    mainContent: {
        flex: 1,
    },
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 15,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    particlesContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    pageContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconOrb: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(42, 28, 20, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 8,
    },
    iconOrbInner: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '300' as const,
        color: Colors.textPrimary,
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center' as const,
    },
    pageSubtitle: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.textSecondary,
        textAlign: 'center' as const,
        letterSpacing: 0.3,
    },
    bottomSection: {
        paddingHorizontal: 24,
        gap: 24,
        alignItems: 'center',
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 28,
        borderWidth: 1,
        minWidth: 200,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '500' as const,
        letterSpacing: 0.5,
    },
});
