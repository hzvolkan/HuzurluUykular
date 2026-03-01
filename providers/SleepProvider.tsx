import { FADE_DURATION_MS, FADE_IN_DURATION_MS, SoundId, SOUNDS } from '@/constants/sounds';
import { createFade, FadeController, linearToLogarithmic } from '@/utils/audio';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

interface SoundState {
    volume: number;
    isEnabled: boolean;
}

type SoundsMap = Record<SoundId, SoundState>;

const DEFAULT_SOUNDS: SoundsMap = {
    fireplace: { volume: 0.5, isEnabled: false },
    rain: { volume: 0.4, isEnabled: false },
    music: { volume: 0.3, isEnabled: false },
};

const VOLUME_STORAGE_KEY = '@sleep_app_volumes';

export const [SleepProvider, useSleep] = createContextHook(() => {
    const [sounds, setSounds] = useState<SoundsMap>(DEFAULT_SOUNDS);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
    const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Using expo-audio players
    const fireplacePlayer = useAudioPlayer(SOUNDS.find(s => s.id === 'fireplace')?.uri);
    const rainPlayer = useAudioPlayer(SOUNDS.find(s => s.id === 'rain')?.uri);
    const musicPlayer = useAudioPlayer(SOUNDS.find(s => s.id === 'music')?.uri);

    const soundInstancesRef = useRef<Record<SoundId, AudioPlayer | null>>({
        fireplace: fireplacePlayer,
        rain: rainPlayer,
        music: musicPlayer,
    });

    useEffect(() => {
        // Ensure static references are synced with React state hooks
        soundInstancesRef.current = {
            fireplace: fireplacePlayer,
            rain: rainPlayer,
            music: musicPlayer,
        };
        // Ensure loops are enabled for all
        [fireplacePlayer, rainPlayer, musicPlayer].forEach((player) => {
            if (player) {
                player.loop = true;
            }
        });
    }, [fireplacePlayer, rainPlayer, musicPlayer]);

    const fadeControllersRef = useRef<FadeController[]>([]);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerEndTimeRef = useRef<number | null>(null);
    const isPlayingRef = useRef(false);
    const soundsRef = useRef(sounds);

    useEffect(() => {
        soundsRef.current = sounds;
    }, [sounds]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        const loadVolumes = async () => {
            try {
                const stored = await AsyncStorage.getItem(VOLUME_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as Partial<SoundsMap>;
                    setSounds((prev) => {
                        const updated = { ...prev };
                        for (const key of Object.keys(parsed) as SoundId[]) {
                            if (updated[key] && parsed[key]) {
                                updated[key] = { ...updated[key], volume: parsed[key]!.volume };
                            }
                        }
                        return updated;
                    });
                }
            } catch (e) {
                console.log('[SleepProvider] Failed to load volumes:', e);
            }
        };
        loadVolumes();
    }, []);

    const saveVolumes = useCallback(async (s: SoundsMap) => {
        try {
            const toSave: Record<string, { volume: number }> = {};
            for (const key of Object.keys(s) as SoundId[]) {
                toSave[key] = { volume: s[key].volume };
            }
            await AsyncStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.log('[SleepProvider] Failed to save volumes:', e);
        }
    }, []);

    const cancelAllFades = useCallback(() => {
        fadeControllersRef.current.forEach((fc) => fc.cancel());
        fadeControllersRef.current = [];
    }, []);

    const stopAllSounds = useCallback(async () => {
        cancelAllFades();

        const ids: SoundId[] = ['fireplace', 'rain', 'music'];
        for (const id of ids) {
            const instance = soundInstancesRef.current[id];
            if (instance) {
                try {
                    instance.pause();
                } catch (e) {
                    console.log(`[SleepProvider] Error stopping ${id}:`, e);
                }
            }
        }

        setIsPlaying(false);
        setSounds((prev) => {
            const updated = { ...prev };
            for (const id of ids) {
                updated[id] = { ...updated[id], isEnabled: false };
            }
            return updated;
        });
    }, [cancelAllFades]);

    const clearTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        timerEndTimeRef.current = null;
        setTimerMinutes(null);
        setTimerSecondsLeft(0);
    }, []);

    const performGlobalFadeOut = useCallback(async () => {
        console.log('[SleepProvider] Starting global fade out');
        setIsFadingOut(true);

        const ids: SoundId[] = ['fireplace', 'rain', 'music'];
        const fadePromises: Promise<void>[] = [];

        for (const id of ids) {
            const instance = soundInstancesRef.current[id];
            if (!instance) continue;

            const currentSound = soundsRef.current[id];
            if (!currentSound.isEnabled) continue;

            const currentLogVolume = linearToLogarithmic(currentSound.volume);

            const promise = new Promise<void>((resolve) => {
                const fc = createFade(currentLogVolume, 0, FADE_DURATION_MS, (vol) => {
                    instance.volume = vol;
                }, resolve);
                fadeControllersRef.current.push(fc);
            });
            fadePromises.push(promise);
        }

        await Promise.all(fadePromises);
        await stopAllSounds();
        clearTimer();
        setIsFadingOut(false);
        console.log('[SleepProvider] Global fade out complete');
    }, [stopAllSounds, clearTimer]);

    const startTimer = useCallback((minutes: number) => {
        clearTimer();

        const endTime = Date.now() + minutes * 60 * 1000;
        timerEndTimeRef.current = endTime;
        setTimerMinutes(minutes);
        setTimerSecondsLeft(minutes * 60);

        timerIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const end = timerEndTimeRef.current;
            if (!end) return;

            const remaining = Math.max(0, Math.ceil((end - now) / 1000));
            setTimerSecondsLeft(remaining);

            if (remaining <= 0) {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
                performGlobalFadeOut();
            }
        }, 1000);

        console.log(`[SleepProvider] Timer started: ${minutes} minutes`);
    }, [clearTimer, performGlobalFadeOut]);

    const cancelTimer = useCallback(() => {
        console.log('[SleepProvider] Timer cancelled');
        clearTimer();
    }, [clearTimer]);

    const toggleSound = useCallback(async (soundId: SoundId) => {
        const current = soundsRef.current[soundId];
        const instance = soundInstancesRef.current[soundId];

        if (current.isEnabled) {
            if (instance) {
                const logVol = linearToLogarithmic(current.volume);
                const fc = createFade(logVol, 0, 500, (vol) => {
                    instance.volume = vol;
                }, () => {
                    instance.pause();
                });
                fadeControllersRef.current.push(fc);
            }

            setSounds((prev) => ({
                ...prev,
                [soundId]: { ...prev[soundId], isEnabled: false },
            }));

            const otherEnabled = (['fireplace', 'rain', 'music'] as SoundId[])
                .filter((id) => id !== soundId)
                .some((id) => soundsRef.current[id].isEnabled);
            if (!otherEnabled) {
                setIsPlaying(false);
            }
        } else {
            setIsLoading(true);
            setLoadError(null);

            if (!instance) {
                setLoadError(`${soundId} oynatılamadı`);
                setIsLoading(false);
                return;
            }

            try {
                instance.play();

                const targetVolume = linearToLogarithmic(current.volume);
                const fc = createFade(0, targetVolume, FADE_IN_DURATION_MS, (vol) => {
                    instance.volume = vol;
                });
                fadeControllersRef.current.push(fc);
            } catch (e) {
                console.log(`[SleepProvider] Error playing ${soundId}:`, e);
                setLoadError(`${soundId} oynatılamadı`);
                setIsLoading(false);
                return;
            }

            setSounds((prev) => ({
                ...prev,
                [soundId]: { ...prev[soundId], isEnabled: true },
            }));
            setIsPlaying(true);
            setIsLoading(false);
        }
    }, []);

    const setVolume = useCallback((soundId: SoundId, volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));

        setSounds((prev) => {
            const updated = {
                ...prev,
                [soundId]: { ...prev[soundId], volume: clampedVolume },
            };
            saveVolumes(updated);
            return updated;
        });

        const instance = soundInstancesRef.current[soundId];
        if (instance) {
            const logVolume = linearToLogarithmic(clampedVolume);
            instance.volume = logVolume;
        }
    }, [saveVolumes]);

    const playAll = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);
        const ids: SoundId[] = ['fireplace', 'rain', 'music'];

        for (const id of ids) {
            const instance = soundInstancesRef.current[id];
            if (!instance) continue;

            try {
                instance.play();
                const targetVolume = linearToLogarithmic(soundsRef.current[id].volume);
                const fc = createFade(0, targetVolume, FADE_IN_DURATION_MS, (vol) => {
                    instance.volume = vol;
                });
                fadeControllersRef.current.push(fc);
            } catch (e) {
                console.log(`[SleepProvider] Error playing ${id}:`, e);
            }
        }

        setSounds((prev) => {
            const updated = { ...prev };
            for (const id of ids) {
                if (soundInstancesRef.current[id]) {
                    updated[id] = { ...updated[id], isEnabled: true };
                }
            }
            return updated;
        });
        setIsPlaying(true);
        setIsLoading(false);
    }, []);

    const pauseAll = useCallback(async () => {
        await stopAllSounds();
        cancelTimer();
    }, [stopAllSounds, cancelTimer]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active' && timerEndTimeRef.current) {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((timerEndTimeRef.current - now) / 1000));
                setTimerSecondsLeft(remaining);

                if (remaining <= 0) {
                    performGlobalFadeOut();
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [performGlobalFadeOut]);

    useEffect(() => {
        const instances = soundInstancesRef.current;
        return () => {
            cancelAllFades();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            const ids: SoundId[] = ['fireplace', 'rain', 'music'];
            ids.forEach((id) => {
                const inst = instances[id];
                if (inst) {
                    inst.pause();
                }
            });
        };
    }, [cancelAllFades]);

    return {
        sounds,
        isPlaying,
        isLoading,
        loadError,
        timerMinutes,
        timerSecondsLeft,
        isFadingOut,
        toggleSound,
        setVolume,
        playAll,
        pauseAll,
        startTimer,
        cancelTimer,
    };
});
