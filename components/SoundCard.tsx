import VolumeSlider from '@/components/VolumeSlider';
import Colors from '@/constants/colors';
import { SoundConfig } from '@/constants/sounds';
import { useSleep } from '@/providers/SleepProvider';
import * as Haptics from 'expo-haptics';
import { CloudRain, Flame, Music } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface SoundCardProps {
    sound: SoundConfig;
    state: { volume: number; isEnabled: boolean };
    translatedName: string;
    translatedDescription: string;
}

const ICONS: Record<string, React.ComponentType<{ color: string; size: number }>> = {
    Flame,
    CloudRain,
    Music,
};

export default React.memo(function SoundCard({
    sound,
    state,
    translatedName,
    translatedDescription,
}: SoundCardProps) {
    const { toggleSound, setVolume } = useSleep();
    const isEnabled = state.isEnabled;
    const volume = state.volume;
    const soundId = sound.id;

    const glowAnim = useSharedValue(isEnabled ? 1 : 0);
    const pressAnim = useSharedValue(1);

    useEffect(() => {
        glowAnim.value = withTiming(isEnabled ? 1 : 0, { duration: 400 });
    }, [isEnabled]);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        pressAnim.value = withTiming(0.95, { duration: 80 }, () => {
            pressAnim.value = withSpring(1, { damping: 6, stiffness: 200 });
        });
        toggleSound(soundId);
    }, [toggleSound, soundId]);

    const onVolumeChange = useCallback((value: number) => {
        setVolume(soundId, value);
    }, [setVolume, soundId]);

    const IconComponent = ICONS[sound.icon] || Music;
    const iconColor = isEnabled ? Colors.accent : Colors.textMuted;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pressAnim.value }],
            borderColor: interpolateColor(
                glowAnim.value,
                [0, 1],
                [Colors.cardBorder, 'rgba(196, 155, 104, 0.3)']
            ),
            backgroundColor: interpolateColor(
                glowAnim.value,
                [0, 1],
                [Colors.card, 'rgba(42, 28, 20, 0.85)']
            ),
        };
    });

    return (
        <Animated.View style={[styles.card, animatedStyle]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.iconButton, isEnabled && styles.iconButtonActive]}
                    onPress={handlePress}
                    activeOpacity={0.7}
                    testID={`sound-toggle-${soundId}`}
                >
                    <IconComponent color={iconColor} size={22} />
                </TouchableOpacity>
                <View style={styles.labelContainer}>
                    <Text style={[styles.name, isEnabled && styles.nameActive]}>{translatedName}</Text>
                    <Text style={styles.description}>{translatedDescription}</Text>
                </View>
                <View style={[styles.statusDot, isEnabled && styles.statusDotActive]} />
            </View>
            <View style={styles.sliderContainer}>
                <VolumeSlider
                    value={volume}
                    onValueChange={onVolumeChange}
                />
            </View>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        marginBottom: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accentDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonActive: {
        backgroundColor: 'rgba(196, 155, 104, 0.2)',
    },
    labelContainer: {
        flex: 1,
        marginLeft: 14,
    },
    name: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    nameActive: {
        color: Colors.textPrimary,
    },
    description: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.textMuted,
        opacity: 0.3,
    },
    statusDotActive: {
        backgroundColor: Colors.accent,
        opacity: 1,
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    sliderContainer: {
        paddingHorizontal: 4,
    },
});
