export type SoundId = 'fireplace' | 'rain' | 'music';

export interface SoundConfig {
    id: SoundId;
    name: { tr: string; en: string };
    description: { tr: string; en: string };
    icon: string;
    uri: string | number;
    defaultVolume: number;
}

export const SOUNDS: SoundConfig[] = [
    {
        id: 'fireplace',
        name: { tr: 'Şömine', en: 'Fireplace' },
        description: { tr: 'Sıcak ateş sesleri', en: 'Warm crackling sounds' },
        icon: 'Flame',
        uri: require('@/assets/audio/fireplace.mp3'),
        defaultVolume: 0.5,
    },
    {
        id: 'rain',
        name: { tr: 'Yağmur', en: 'Rain' },
        description: { tr: 'Hafif yağmur damlaları', en: 'Light rain drops' },
        icon: 'CloudRain',
        uri: require('@/assets/audio/rain.mp3'),
        defaultVolume: 0.4,
    },
    {
        id: 'music',
        name: { tr: 'Uyku Müziği', en: 'Sleep Music' },
        description: { tr: 'Yumuşak ritimler', en: 'Soft lofi rhythms' },
        icon: 'Music',
        uri: require('@/assets/audio/lofi.mp3'),
        defaultVolume: 0.3,
    },
];

export const TIMER_OPTIONS = [5, 10, 20, 30, 40, 50, 60] as const;
export type TimerMinutes = (typeof TIMER_OPTIONS)[number];

export const FADE_DURATION_MS = 7000;
export const FADE_IN_DURATION_MS = 2000;
export const FADE_STEPS = 30;
