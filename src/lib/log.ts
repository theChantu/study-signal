import store from "../store/store";
import { onExtensionMessage } from "@/messages/onExtensionMessage";

let enabled = false;

async function initDebug() {
    const { debug } = await store.globals.get(["debug"]);
    enabled = debug.enabled;
}

const log: typeof console.log = (...args) => {
    if (enabled) console.log("[Study Signal]", ...args);
};

onExtensionMessage("store-changed", (changed) => {
    if (changed.namespace === "globals" && "debug" in changed.data) {
        if (changed.data.debug?.enabled === undefined) return;
        enabled = changed.data.debug.enabled;
    }
});

initDebug();

export default log;
