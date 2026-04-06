import { defaultSiteSettings } from "./defaultSiteSettings";
import {
    defaultGlobalSettings,
    defaultGlobalSettingsKeys,
} from "./defaultGlobalSettings";
import { defaultSettings } from "./defaultSettings";
import { storage } from "#imports";
import { SiteName, sites } from "@/adapters/siteConfigs";
import deepMerge from "@/lib/deepMerge";
import { normalizeSiteState } from "./sitePolicies";

import type {
    SiteSettings,
    GlobalSettings,
    Settings,
    DeepPartial,
} from "./types";

type StorageKey = `local:${string}`;

export type SettingsPatch = DeepPartial<Settings>;
export type SettingsUpdate = Partial<Settings>;

export type GlobalSettingsSet = Partial<GlobalSettings>;
export type SiteSettingsSet = Partial<SiteSettings>;

export type GlobalSettingsPatch = DeepPartial<GlobalSettings>;
export type SiteSettingsPatch = DeepPartial<SiteSettings>;

export type GlobalSettingsChange = GlobalSettingsSet | GlobalSettingsPatch;
export type SiteSettingsChange = SiteSettingsSet | SiteSettingsPatch;

function toStorageKey(key: string): StorageKey {
    return `local:settings:${key}` as const;
}

type State = object;

type NamespaceStoreGetResult<
    TState,
    K extends readonly (keyof TState)[],
> = Pick<TState, K[number]>;

type NamespaceMutationResult<TState> = Partial<TState>;

export type StoreGetResult<TState, K extends readonly (keyof TState)[]> = Pick<
    TState,
    K[number]
>;

type NamespaceStoreSubscription = () => void;

type Change<T> = Partial<T> | DeepPartial<T>;
type Listener<T> = (change: Change<T>) => void;

interface NamespaceStore<
    TState extends State,
    TPatch extends DeepPartial<TState>,
> {
    get<K extends readonly (keyof TState)[]>(
        keys: K,
    ): Promise<StoreGetResult<TState, K>>;
    set(values: Partial<TState>): Promise<NamespaceMutationResult<TState>>;
    patch(patch: TPatch): Promise<NamespaceMutationResult<TState>>;
    subscribe(listener: Listener<TState>): NamespaceStoreSubscription;
}

export type StoreNamespace = "globals" | SiteName;

type NamespaceConfig<
    TState extends State,
    TPatch extends DeepPartial<TState>,
> = {
    namespace: StoreNamespace;
    defaults: TState;
    mergePatch: (current: TState, patch: DeepPartial<TState>) => TState;
    normalize?: (current: TState) => {
        current: TState;
        persistedPatch?: DeepPartial<TState>;
    };
    listeners: Set<(changed: Change<TState>) => void>;
};

type GlobalsStore = NamespaceStore<GlobalSettings, DeepPartial<GlobalSettings>>;
type SiteStore = NamespaceStore<SiteSettings, DeepPartial<SiteSettings>>;

export interface Store {
    readonly globals: GlobalsStore;
    site(name: SiteName): SiteStore;
}

export class SettingsStore implements Store {
    public readonly globals: GlobalsStore;
    private readonly sites = new Map<SiteName, SiteStore>();

    constructor() {
        this.globals = this.createGlobalsStore();
    }

    public site(name: SiteName): SiteStore {
        if (!this.sites.has(name)) {
            this.sites.set(name, this.createSiteStore(name));
        }

        const cached = this.sites.get(name);
        if (cached) return cached;

        const scoped = this.createSiteStore(name);
        this.sites.set(name, scoped);
        return scoped;
    }

    private createGlobalsStore(): GlobalsStore {
        return this.createNamespaceStore<
            GlobalSettings,
            DeepPartial<GlobalSettings>
        >({
            namespace: "globals",
            defaults: defaultGlobalSettings,
            mergePatch: (current, patch) => deepMerge(current, patch),
            listeners: new Set<Listener<GlobalSettings>>(),
        });
    }

    private createSiteStore(name: SiteName): SiteStore {
        return this.createNamespaceStore<
            SiteSettings,
            DeepPartial<SiteSettings>
        >({
            namespace: name,
            defaults: defaultSiteSettings,
            mergePatch: (current, patch) => deepMerge(current, patch),
            normalize: normalizeSiteState,
            listeners: new Set<Listener<SiteSettings>>(),
        });
    }

    private createNamespaceStore<
        TState extends State,
        TPatch extends DeepPartial<TState>,
    >(config: NamespaceConfig<TState, TPatch>): NamespaceStore<TState, TPatch> {
        async function loadResolvedState(): Promise<{
            current: TState;
            stored: DeepPartial<TState>;
        }> {
            const storageKey = toStorageKey(config.namespace);
            const stored =
                (await storage.getItem<DeepPartial<TState>>(storageKey)) ??
                ({} as DeepPartial<TState>);
            let current = config.mergePatch(config.defaults, stored);

            if (config.normalize) {
                const normalized = config.normalize(current);
                current = normalized.current;

                if (normalized.persistedPatch) {
                    const repaired = deepMerge(
                        stored,
                        normalized.persistedPatch,
                    ) as DeepPartial<TState>;
                    await storage.setItem(storageKey, repaired);
                    return { current, stored: repaired };
                }
            }

            return { current, stored };
        }

        async function resolveChanged(
            changed: Change<TState>,
        ): Promise<Partial<TState>> {
            const keys = Object.keys(changed) as (keyof TState)[];
            if (keys.length === 0) return {};
            return (await get(
                keys as readonly (keyof TState)[],
            )) as Partial<TState>;
        }

        function notify(changed: Change<TState>) {
            if (Object.keys(changed).length === 0) return;
            for (const listener of config.listeners) listener(changed);
        }

        function stripUndefined<T extends object>(value: T): T {
            return Object.fromEntries(
                Object.entries(value).filter(([, v]) => v !== undefined),
            ) as T;
        }

        async function commit(
            raw: Change<TState>,
            mode: "set" | "patch",
        ): Promise<Partial<TState>> {
            const changed = stripUndefined(raw) as Change<TState>;
            if (Object.keys(changed).length === 0) return {};

            const { stored } = await loadResolvedState();
            const nextStored =
                mode === "set"
                    ? ({ ...stored, ...changed } as DeepPartial<TState>)
                    : (deepMerge(stored, changed) as DeepPartial<TState>);

            await storage.setItem(toStorageKey(config.namespace), nextStored);
            notify(changed);

            return await resolveChanged(changed);
        }

        const get: NamespaceStore<TState, TPatch>["get"] = async (keys) => {
            const { current } = await loadResolvedState();

            const result = Object.fromEntries(
                keys.map((k) => [k, current[k]]),
            ) as NamespaceStoreGetResult<TState, typeof keys>;

            return result;
        };
        const set: NamespaceStore<TState, TPatch>["set"] = async (values) => {
            return await commit(values, "set");
        };
        const patch: NamespaceStore<TState, TPatch>["patch"] = async (
            patch,
        ) => {
            return await commit(patch, "patch");
        };
        const subscribe: NamespaceStore<TState, TPatch>["subscribe"] = (
            listener,
        ) => {
            config.listeners.add(listener);
            return () => config.listeners.delete(listener);
        };

        return { get, set, patch, subscribe };
    }
}
