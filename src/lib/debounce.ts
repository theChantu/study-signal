export default function debounce<F extends (...args: any[]) => any>(
    fn: F,
    delay = 300,
): (...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            Promise.resolve(fn(...args)).catch(console.error);
        }, delay);
    };
}
