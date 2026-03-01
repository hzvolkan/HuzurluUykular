import Colors from '@/constants/colors';
import { TIMER_OPTIONS } from '@/constants/sounds';
import { formatTime } from '@/utils/audio';
import * as Haptics from 'expo-haptics';
import { Timer, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SleepTimerProps {
    timerMinutes: number | null;
    timerSecondsLeft: number;
    isFadingOut: boolean;
    onStartTimer: (minutes: number) => void;
    onCancelTimer: () => void;
}

export default React.memo(function SleepTimer({
    timerMinutes,
    timerSecondsLeft,
    isFadingOut,
    onStartTimer,
    onCancelTimer,
}: SleepTimerProps) {
    const { t } = useTranslation();

    const handleTimerPress = useCallback((minutes: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onStartTimer(minutes);
    }, [onStartTimer]);

    const handleCancel = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onCancelTimer();
    }, [onCancelTimer]);

    if (timerMinutes !== null) {
        const progress = timerSecondsLeft / (timerMinutes * 60);

        return (
            <View style={styles.container} testID="sleep-timer-active">
                <View style={styles.activeTimerHeader}>
                    <Timer color={Colors.accent} size={18} />
                    <Text style={styles.activeTimerLabel}>
                        {timerMinutes} {t('common.timer.minutes')} {t('common.timer.timeLeft')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.cancelButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        testID="timer-cancel"
                    >
                        <X color={Colors.textSecondary} size={16} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.countdown}>
                    {isFadingOut
                        ? t('common.timer.fading')
                        : formatTime(timerSecondsLeft)}
                </Text>

                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarTrack}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                { width: `${Math.round(progress * 100)}%` },
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container} testID="sleep-timer">
            <View style={styles.timerHeader}>
                <Timer color={Colors.textSecondary} size={16} />
                <Text style={styles.timerTitle}>
                    {t('common.timer.select')}
                </Text>
            </View>
            <View style={styles.optionsRow}>
                {TIMER_OPTIONS.map((minutes) => (
                    <TouchableOpacity
                        key={minutes}
                        style={styles.timerOption}
                        onPress={() => handleTimerPress(minutes)}
                        activeOpacity={0.7}
                        testID={`timer-${minutes}`}
                    >
                        <Text style={styles.timerOptionText}>{minutes}</Text>
                        <Text style={styles.timerOptionUnit}>{t('common.timer.minutes')}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    timerHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    timerTitle: {
        fontSize: 14,
        fontWeight: '500' as const,
        color: Colors.textSecondary,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },
    optionsRow: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        gap: 8,
    },
    timerOption: {
        flex: 1,
        backgroundColor: Colors.timerInactive,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(196, 155, 104, 0.06)',
    },
    timerOptionText: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.textPrimary,
    },
    timerOptionUnit: {
        fontSize: 10,
        color: Colors.textMuted,
        marginTop: 2,
        textTransform: 'uppercase' as const,
    },
    activeTimerHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    activeTimerLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500' as const,
        color: Colors.accent,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },
    cancelButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(196, 155, 104, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdown: {
        fontSize: 48,
        fontWeight: '200' as const,
        color: Colors.textPrimary,
        textAlign: 'center' as const,
        letterSpacing: 4,
        fontVariant: ['tabular-nums' as const],
    },
    progressBarContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    progressBarTrack: {
        height: 3,
        backgroundColor: Colors.sliderTrack,
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.accent,
        borderRadius: 1.5,
    },
    timerHint: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center' as const,
        marginTop: 8,
    },
});
