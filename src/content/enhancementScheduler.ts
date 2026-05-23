import log from "@/lib/log";

const ENHANCEMENT_RUN_DELAY_MS = 300;
const ENHANCEMENT_FOLLOW_UP_DELAY_MS = 150;

export type EnhancementRunReason =
    | "initial"
    | "dom"
    | "settings"
    | "follow-up";

type QueuedEnhancementRun = {
    reason: EnhancementRunReason;
    followUp: boolean;
};

type ScheduleOptions = {
    delay?: number;
    followUp?: boolean;
};

type EnhancementSchedulerOptions = {
    run(reason: EnhancementRunReason): Promise<void>;
};

export function hasRelevantDomChanges(mutations: MutationRecord[]): boolean {
    return mutations.some(
        (mutation) =>
            mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0,
    );
}

export function createEnhancementScheduler({
    run,
}: EnhancementSchedulerOptions) {
    let runTimer: ReturnType<typeof setTimeout> | undefined;
    let runInProgress = false;
    let queuedDuringRun: QueuedEnhancementRun | null = null;

    function schedule(
        reason: EnhancementRunReason,
        options: ScheduleOptions = {},
    ): void {
        const followUp = options.followUp ?? false;

        if (runInProgress) {
            queuedDuringRun = {
                reason,
                followUp: queuedDuringRun?.followUp || followUp,
            };
            log("Enhancement run queued while another run is active.", {
                reason,
                followUp,
            });
            return;
        }

        if (runTimer) clearTimeout(runTimer);

        log("Enhancement run scheduled.", { reason, followUp });
        runTimer = setTimeout(() => {
            void execute(reason, followUp);
        }, options.delay ?? ENHANCEMENT_RUN_DELAY_MS);
    }

    async function execute(
        reason: EnhancementRunReason,
        followUp: boolean,
    ): Promise<void> {
        runTimer = undefined;
        runInProgress = true;

        try {
            await run(reason);
        } finally {
            runInProgress = false;
        }

        if (queuedDuringRun) {
            const queued = queuedDuringRun;
            queuedDuringRun = null;
            schedule(queued.reason, {
                delay: 0,
                followUp: queued.followUp,
            });
            return;
        }

        if (followUp) {
            log("Enhancement follow-up scheduled.", { reason });
            schedule("follow-up", {
                delay: ENHANCEMENT_FOLLOW_UP_DELAY_MS,
                followUp: false,
            });
        }
    }

    async function runNow(reason: EnhancementRunReason): Promise<void> {
        if (runTimer) {
            clearTimeout(runTimer);
            runTimer = undefined;
        }

        await execute(reason, false);
    }

    function scheduleFollowUp(): void {
        schedule("follow-up", {
            delay: ENHANCEMENT_FOLLOW_UP_DELAY_MS,
            followUp: false,
        });
    }

    return { runNow, schedule, scheduleFollowUp };
}
