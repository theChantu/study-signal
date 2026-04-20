<script lang="ts">
    import { slide } from "svelte/transition";
    import { ChevronDown, Plus, X } from "@lucide/svelte";
    import SelectControl from "@/components/SelectControl.svelte";
    import SuggestionList from "@/components/SuggestionList.svelte";
    import Subsection from "@/components/Subsection.svelte";
    import {
        alertRuleFieldLabels,
        alertRuleFieldPlaceholders,
        alertRuleFields,
        alertRuleOperatorLabels,
        getAlertRuleFieldType,
        getAlertRuleOperators,
        getDefaultAlertRuleOperator,
        type AlertCondition,
        type AlertRuleField,
        type AlertRuleGroup,
        type AlertRuleGroupMode,
        type AlertRuleOperator,
    } from "@/lib/notifications/alertRules";

    type AlertRuleGroupEditorProps = {
        title: string;
        group: AlertRuleGroup;
        emptyLabel: string;
        suggestions?: Partial<Record<AlertRuleField, string[]>>;
        onChange: (group: AlertRuleGroup) => void;
    };

    let {
        title,
        group,
        emptyLabel,
        suggestions = {},
        onChange,
    }: AlertRuleGroupEditorProps = $props();

    function createCondition(): AlertCondition {
        const field: AlertRuleField = "rate";

        return {
            id: crypto.randomUUID(),
            field,
            operator: getDefaultAlertRuleOperator(field),
        };
    }

    function updateGroup(patch: Partial<AlertRuleGroup>) {
        onChange({
            ...group,
            ...patch,
        });
    }

    function updateCondition(
        condition: AlertCondition,
        patch: Partial<AlertCondition>,
    ) {
        const nextCondition = {
            ...condition,
            ...patch,
        };

        updateGroup({
            conditions: group.conditions.map((candidate) =>
                candidate.id === condition.id ? nextCondition : candidate,
            ),
        });
    }

    function addCondition() {
        updateGroup({
            conditions: [...group.conditions, createCondition()],
        });
    }

    function removeCondition(condition: AlertCondition) {
        updateGroup({
            conditions: group.conditions.filter(
                (candidate) => candidate.id !== condition.id,
            ),
        });
    }

    function onModeChange(e: Event) {
        updateGroup({
            mode: (e.currentTarget as HTMLSelectElement)
                .value as AlertRuleGroupMode,
        });
    }

    function onFieldChange(condition: AlertCondition, e: Event) {
        const field = (e.currentTarget as HTMLSelectElement)
            .value as AlertRuleField;
        const operators = getAlertRuleOperators(field);
        const operator = operators.includes(condition.operator)
            ? condition.operator
            : getDefaultAlertRuleOperator(field);

        updateCondition(condition, {
            field,
            operator,
            value: undefined,
        });
    }

    function onOperatorChange(condition: AlertCondition, e: Event) {
        const operator = (e.currentTarget as HTMLSelectElement)
            .value as AlertRuleOperator;

        updateCondition(condition, {
            operator,
            value: condition.value,
        });
    }

    function onValueChange(condition: AlertCondition, e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        let value: string | number | undefined;

        if (getAlertRuleFieldType(condition.field) === "number") {
            value = Number.isFinite(input.valueAsNumber)
                ? input.valueAsNumber
                : undefined;
        } else {
            value = input.value;
        }

        updateCondition(condition, { value });
    }

    let focusedConditionId = $state<string | null>(null);

    function getConditionSuggestions(condition: AlertCondition): string[] {
        return suggestions[condition.field] ?? [];
    }

    function getFilteredSuggestions(condition: AlertCondition): string[] {
        const all = getConditionSuggestions(condition);
        const input = String(condition.value ?? "")
            .trim()
            .toLowerCase();
        if (input.length === 0) return all.slice(0, 5);
        return all.filter((s) => s.toLowerCase().includes(input)).slice(0, 5);
    }

    function selectSuggestion(condition: AlertCondition, value: string) {
        updateCondition(condition, { value });
        focusedConditionId = null;
    }
</script>

<Subsection
    className="flex flex-col gap-2"
    borderClass="border-popup-border-subtle"
>
    <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-popup-text-muted">{title}</span>
        {#if group.conditions.length >= 2}
            <div class="min-w-30">
                <SelectControl
                    variant="sm"
                    value={group.mode}
                    onchange={onModeChange}
                >
                    <option value="all">All match</option>
                    <option value="any">Any match</option>
                </SelectControl>
            </div>
        {/if}
    </div>

    {#if group.conditions.length === 0}
        <div
            class="rounded-lg border border-dashed border-popup-border px-3 py-2.5 text-center text-xs text-popup-text-faint"
        >
            {emptyLabel}
        </div>
    {:else}
        <div class="flex flex-col gap-2">
            {#each group.conditions as condition (condition.id)}
                <div
                    class="flex items-center gap-1.5"
                    transition:slide={{ duration: 150 }}
                >
                    <div class="relative min-w-0 flex-1">
                        <div class="flex rounded-md border border-popup-border bg-popup-surface">
                            <div class="relative shrink-0 border-r border-popup-border">
                                <select
                                    class="h-full cursor-pointer appearance-none border-none bg-transparent py-1.5 pr-5 pl-2 text-xs font-[inherit] text-popup-text outline-none"
                                    value={condition.field}
                                    onchange={(e) => onFieldChange(condition, e)}
                                >
                                    {#each alertRuleFields as field}
                                        <option value={field}>
                                            {alertRuleFieldLabels[field]}
                                        </option>
                                    {/each}
                                </select>
                                <div class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-popup-text-faint">
                                    <ChevronDown size={10} strokeWidth={2.4} />
                                </div>
                            </div>
                            <div class="relative shrink-0 border-r border-popup-border">
                                <select
                                    class="h-full cursor-pointer appearance-none border-none bg-transparent py-1.5 pr-5 pl-2 text-xs font-[inherit] text-popup-text outline-none"
                                    value={condition.operator}
                                    onchange={(e) => onOperatorChange(condition, e)}
                                >
                                    {#each getAlertRuleOperators(condition.field) as operator}
                                        <option value={operator}>
                                            {alertRuleOperatorLabels[operator]}
                                        </option>
                                    {/each}
                                </select>
                                <div class="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-popup-text-faint">
                                    <ChevronDown size={10} strokeWidth={2.4} />
                                </div>
                            </div>
                            <input
                                type={getAlertRuleFieldType(condition.field) === "number" ? "number" : "text"}
                                step={getAlertRuleFieldType(condition.field) === "number" ? "any" : undefined}
                                class="min-w-0 flex-1 border-none bg-transparent px-2 py-1.5 text-xs font-[inherit] text-popup-text outline-none placeholder:text-popup-text-faint"
                                value={condition.value ?? ""}
                                placeholder={alertRuleFieldPlaceholders[condition.field]}
                                aria-label="Condition value"
                                oninput={(e) => onValueChange(condition, e)}
                                onfocus={() => (focusedConditionId = condition.id)}
                                onblur={() => (focusedConditionId = null)}
                            />
                        </div>
                        {#if focusedConditionId === condition.id && getAlertRuleFieldType(condition.field) === "text"}
                            <SuggestionList
                                items={getFilteredSuggestions(condition)}
                                onSelect={(value) => selectSuggestion(condition, value)}
                            />
                        {/if}
                    </div>
                    <button
                        type="button"
                        class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-popup-text-faint hover:text-popup-danger-text"
                        onclick={() => removeCondition(condition)}
                        aria-label="Remove condition"
                        title="Remove condition"
                    >
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>
            {/each}
        </div>
    {/if}

    <button
        type="button"
        class="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded border border-dashed border-popup-border bg-transparent px-2.5 text-xs font-medium text-popup-text-faint hover:border-popup-text-faint hover:text-popup-text-soft"
        onclick={addCondition}
    >
        <Plus size={13} />
        Add condition
    </button>
</Subsection>
