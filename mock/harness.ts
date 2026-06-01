// Dev harness logic for the Prolific mock page.
//
// Served transpiled to JS by mock/server.ts (via Bun). Type-checked by the
// repo's `tsc --noEmit` since mock/*.ts is in the tsconfig include.
//
// Builds the adapter-visible DOM (study list + projects sidebar) from in-memory
// state; every add/remove rebuilds it, firing the content script's
// MutationObserver. Keep the selectors here in sync with ProlificAdapter.

import type { StudyInfo } from "@/adapters/BaseAdapter";

type Study = {
    [K in "id" | "title" | "symbol" | "reward" | "rate"]: NonNullable<
        StudyInfo[K]
    >;
};

interface Project {
    name: string;
    count: number;
}

const byId = <T extends HTMLElement = HTMLElement>(id: string): T =>
    document.getElementById(id) as T;
const input = (id: string) => byId<HTMLInputElement>(id);
const select = (id: string) => byId<HTMLSelectElement>(id);

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: Partial<HTMLElementTagNameMap[K]> = {},
    attrs: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
    const node = Object.assign(document.createElement(tag), props);
    for (const [name, value] of Object.entries(attrs))
        node.setAttribute(name, value);
    return node;
}

let studies: Study[] = [];
let projects: Project[] = [];

function render(): void {
    byId("study-list").replaceChildren(
        ...studies.map((s) => {
            const tags = el("ul", { className: "study-tags" });
            tags.append(
                el(
                    "span",
                    { textContent: `${s.symbol}${s.reward.toFixed(2)}` },
                    { "data-testid": "study-tag-reward" },
                ),
                el(
                    "span",
                    { textContent: `${s.symbol}${s.rate.toFixed(2)}/hr` },
                    { "data-testid": "study-tag-reward-per-hour" },
                ),
                el(
                    "span",
                    { textContent: "13 mins" },
                    { "data-testid": "study-tag-completion-time" },
                ),
                el(
                    "span",
                    { textContent: "42 places" },
                    { "data-testid": "study-tag-places" },
                ),
            );

            const content = el("div", { className: "study-content" });
            content.append(
                el("h2", { textContent: s.title }),
                el(
                    "span",
                    { textContent: "University of Example" },
                    { "aria-labelledby": `host-name-${s.id}` },
                ),
                tags,
            );

            const li = el("li", {}, { "data-testid": `study-${s.id}` });
            li.append(content);
            return li;
        }),
    );

    byId("project-list").replaceChildren(
        ...projects.map((p) => {
            const li = el("li");
            li.append(
                el("span", {
                    className: "nav-item__text",
                    textContent: p.name,
                }),
            );
            if (p.count > 0)
                li.append(
                    el("sup", {
                        className: "indicator",
                        textContent: String(p.count),
                    }),
                );
            return li;
        }),
    );
}

byId("add-study").onclick = () => {
    studies.push({
        id: crypto.randomUUID().slice(0, 8),
        title: input("f-title").value || "Untitled",
        symbol: select("f-symbol").value,
        reward: parseFloat(input("f-reward").value) || 0,
        rate: parseFloat(input("f-rate").value) || 0,
    });
    render();
};
byId("remove-study").onclick = () => {
    studies.pop();
    render();
};
byId("clear-studies").onclick = () => {
    studies = [];
    render();
};

byId("add-project").onclick = () => {
    projects.push({
        name: input("p-name").value || "Untitled",
        count: parseInt(input("p-count").value, 10) || 0,
    });
    render();
};
byId("remove-project").onclick = () => {
    projects.pop();
    render();
};

render();

export {};
