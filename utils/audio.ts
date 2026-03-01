import { FADE_STEPS } from '@/constants/sounds';

export function linearToLogarithmic(value: number): number {
    const clamped = Math.max(0, Math.min(1, value));
    if (clamped === 0) return 0;
    return Math.pow(clamped, 2.5);
}

export function logarithmicToLinear(value: number): number {
    const clamped = Math.max(0, Math.min(1, value));
    if (clamped === 0) return 0;
    return Math.pow(clamped, 1 / 2.5);
}

export interface FadeController {
    cancel: () => void;
}

export function createFade(
    fromVolume: number,
    toVolume: number,
    durationMs: number,
    onStep: (volume: number) => void,
    onComplete?: () => void,
): FadeController {
    let cancelled = false;
    const steps = FADE_STEPS;
    const stepDuration = durationMs / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        if (cancelled) {
            clearInterval(interval);
            return;
        }

        currentStep++;
        if (currentStep >= steps) {
            clearInterval(interval);
            onStep(toVolume);
            onComplete?.();
            return;
        }

        const easeProgress = currentStep / steps;
        const easedValue = easeProgress < 0.5
            ? 2 * easeProgress * easeProgress
            : 1 - Math.pow(-2 * easeProgress + 2, 2) / 2;

        const volume = fromVolume + (toVolume - fromVolume) * easedValue;
        onStep(Math.max(0, Math.min(1, volume)));
    }, stepDuration);

    return {
        cancel: () => {
            cancelled = true;
            clearInterval(interval);
        },
    };
}

export function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
