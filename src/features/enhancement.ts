import getSiteAdapter from "../lib/getSiteAdapter";

export default abstract class Enhancement {
    readonly adapter: ReturnType<typeof getSiteAdapter>;

    constructor() {
        const adapter = getSiteAdapter();
        this.adapter = adapter;
    }

    abstract apply(): void;
    abstract revert(): void;
}
