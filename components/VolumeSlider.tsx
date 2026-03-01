import Colors from '@/constants/colors';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface VolumeSliderProps {
    value: number;
    onValueChange: (value: number) => void;
}

export default React.memo(function VolumeSlider({ value, onValueChange }: VolumeSliderProps) {
    const [trackWidth, setTrackWidth] = useState(0);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setTrackWidth(e.nativeEvent.layout.width);
    }, []);

    // Reanimated Shared Values
    const thumbScale = useSharedValue(1);
    const activeOpacity = useSharedValue(0);
    const startValue = useSharedValue(value);

    const handleValueChange = (val: number) => {
        onValueChange(val);
    };

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            thumbScale.value = withSpring(1.3, { damping: 8, stiffness: 100 });
            activeOpacity.value = withTiming(1, { duration: 150 });
            startValue.value = value;
        })
        .onUpdate((e) => {
            if (trackWidth > 0) {
                const deltaValue = e.translationX / trackWidth;
                const newValue = Math.max(0, Math.min(1, startValue.value + deltaValue));
                runOnJS(handleValueChange)(newValue);
            }
        })
        .onFinalize(() => {
            thumbScale.value = withSpring(1, { damping: 8, stiffness: 100 });
            activeOpacity.value = withTiming(0, { duration: 200 });
        });

    const fillPercent = `${Math.round(value * 100)}%` as const;

    const activeOverlayStyle = useAnimatedStyle(() => ({
        opacity: activeOpacity.value,
    }));

    const thumbAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: thumbScale.value }, { translateX: -8 }],
    }));

    return (
        <GestureDetector gesture={panGesture}>
            <View
                style={[styles.container]}
                onLayout={onLayout}
                testID="volume-slider"
                collapsable={false}
            >
                <View style={styles.track}>
                    <View style={[styles.fill, { width: fillPercent }]} />
                    <Animated.View
                        style={[
                            styles.glowOverlay,
                            { width: fillPercent },
                            activeOverlayStyle,
                        ]}
                    />
                </View>
                <Animated.View
                    style={[
                        styles.thumb,
                        { left: fillPercent },
                        thumbAnimatedStyle,
                    ]}
                >
                    <View style={styles.thumbInner} />
                </Animated.View>
            </View>
        </GestureDetector>
    );
});

const styles = StyleSheet.create({
    container: {
        height: 36,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: 4,
        backgroundColor: Colors.sliderTrack,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: Colors.sliderFill,
        borderRadius: 2,
    },
    glowOverlay: {
        position: 'absolute',
        left: 0,
        top: -2,
        bottom: -2,
        backgroundColor: 'rgba(196, 155, 104, 0.3)',
        borderRadius: 4,
    },
    thumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.accent,
        shadowColor: Colors.accentGlow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },
});
