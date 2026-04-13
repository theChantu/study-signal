export const nowState = $state({ value: Date.now() });

export function startNowTicker() {
    const id = setInterval(() => {
        nowState.value = Date.now();
    }, 15_000);
    return () => clearInterval(id);
}
