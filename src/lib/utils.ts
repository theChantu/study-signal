function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractSymbol(text: string) {
    const m = text.match(/[£$€]/);
    return m ? m[0] : null;
}

function getRandomTimeoutMs(min: number, max: number): number {
    const lower = Math.min(min, max);
    const upper = Math.max(min, max);

    return (
        Math.floor(Math.random() * (upper - lower + 1)) + lower
    ) * 60 * 1000;
}

function scheduleTimeout(fn: () => void, delay = 300) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
        timeout = setTimeout(() => {
            timeout = null;
            fn();
        }, delay);
    };

    return {
        start() {
            if (!timeout) run();
        },
        reset() {
            if (timeout) clearTimeout(timeout);
            run();
        },
        clear() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        },
        setDelay(newDelay: number) {
            delay = newDelay;
            if (timeout) {
                clearTimeout(timeout);
                run();
            }
        },
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function rateToColor(rate: number, min = 7, max = 15, dark = false) {
    const clamped = Math.min(Math.max(rate, min), max);

    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logRate = Math.log(clamped);

    const ratio = (logRate - logMin) / (logMax - logMin);
    const t = Math.pow(ratio, 0.6);

    const [fromR, fromG, fromB] = dark ? [90, 95, 105] : [156, 163, 175];
    const [toR, toG, toB] = dark ? [80, 200, 110] : [22, 163, 74];

    const r = Math.round(fromR * (1 - t) + toR * t);
    const g = Math.round(fromG * (1 - t) + toG * t);
    const b = Math.round(fromB * (1 - t) + toB * t);

    return `rgb(${r}, ${g}, ${b})`;
}

export {
    clamp,
    extractSymbol,
    getRandomTimeoutMs,
    scheduleTimeout,
    capitalize,
    rateToColor,
};
