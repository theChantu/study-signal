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

function rateToColor(rate: number, min = 7, max = 15) {
    const clamped = Math.min(Math.max(rate, min), max);

    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logRate = Math.log(clamped);

    const ratio = (logRate - logMin) / (logMax - logMin);
    const t = Math.pow(ratio, 0.6);

    // gray -> green.
    const r = Math.round(156 * (1 - t) + 22 * t);
    const g = Math.round(163 * (1 - t) + 163 * t);
    const b = Math.round(175 * (1 - t) + 74 * t);

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
