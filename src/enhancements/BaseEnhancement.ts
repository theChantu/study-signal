import type { BaseAdapter } from "@/adapters";
import type { Settings } from "@/store/types";

export default abstract class BaseEnhancement {
    constructor(
        protected readonly adapter: BaseAdapter,
        protected readonly settings: Settings,
    ) {}

    abstract apply(): Promise<void>;
    abstract revert(): Promise<void>;

    async run() {
        await this.revert();
        await this.apply();
    }
}
