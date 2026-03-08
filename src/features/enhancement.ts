import getSiteAdapter from "../config";

export default abstract class Enhancement {
    readonly siteAdapter: ReturnType<typeof getSiteAdapter>;

    constructor() {
        this.siteAdapter = getSiteAdapter();
    }

    abstract apply(): void;
    abstract revert(): void;
}
