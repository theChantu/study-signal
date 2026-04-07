import deepMerge from "../../lib/deepMerge";
import {
    enhancementConfigs,
    type EnhancementKey,
} from "@/enhancements/enhancementConfigs";
import log from "@/lib/log";

import type { Settings } from "@/store/types";
import type { BaseAdapter } from "@/adapters";
import type { StoreChangedMessage } from "@/messages/types";

const enhancementConfigArray = Object.entries(enhancementConfigs).map(
    ([key, config]) => ({
        key: key as EnhancementKey,
        ...config,
    }),
);
enhancementConfigArray.sort(
    (a, b) => Number(Boolean(b.priority)) - Number(Boolean(a.priority)),
);

export class EnhancementHandler {
    private enhancementConfigs: typeof enhancementConfigArray;

    constructor(
        private adapter: BaseAdapter,
        private settings: Settings,
    ) {
        this.enhancementConfigs = enhancementConfigArray.filter((config) =>
            adapter.hasModule(config.key),
        );
    }

    async initialize() {}

    async update(changed: StoreChangedMessage["data"]) {
        this.settings = deepMerge(this.settings, changed);

        for (const config of this.enhancementConfigs) {
            if (!(config.key in changed)) continue;

            const enhancement = new config.enhancement(
                this.adapter,
                this.settings,
            );
            const enabled = this.settings[config.key].enabled;

            enabled ? await enhancement.run() : await enhancement.revert();
        }
    }

    async run() {
        log("Running enhancements...");

        for (const config of this.enhancementConfigs) {
            const enhancement = new config.enhancement(
                this.adapter,
                this.settings,
            );
            const enabled = this.settings[config.key]?.enabled;

            enabled ? await enhancement.apply() : await enhancement.revert();
        }
    }

    destroy() {}
}
