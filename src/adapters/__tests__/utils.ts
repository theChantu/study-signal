export function createClassList(classNames: string[] = []) {
    const values = new Set(classNames);

    return {
        contains(name: string) {
            return values.has(name);
        },
        [Symbol.iterator]: function* () {
            yield* values;
        },
    } as unknown as DOMTokenList;
}

export function createCapabilityElement(options: {
    text?: string;
    attrs?: Record<string, string>;
    classes?: string[];
    supported?: boolean;
}) {
    const { text = "", attrs = {}, classes = [], supported = false } = options;
    const classNames = supported ? [...classes, "text-green-600"] : classes;

    return {
        textContent: text,
        classList: createClassList(classNames),
        getAttribute(name: string) {
            return attrs[name] ?? null;
        },
        closest(selector: string) {
            return selector === ".text-green-600" && supported ? this : null;
        },
    } as unknown as HTMLElement;
}

export function createQueryElement(
    elements:
        | HTMLElement[]
        | Partial<Record<string, HTMLElement[]>>,
) {
    return {
        querySelectorAll(selector: string) {
            if (Array.isArray(elements)) {
                return elements;
            }

            return elements[selector] ?? [];
        },
    } as unknown as HTMLElement;
}
