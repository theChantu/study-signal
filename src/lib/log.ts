import store from "../store/store";
import { onExtensionMessage } from "@/messages/onExtensionMessage";

let enabled = false;

async function initDebug() {
    const { enableDebug } = await store.globals.get(["enableDebug"]);
    enabled = enableDebug;
}

const log: typeof console.log = (...args) => {
    if (enabled) console.log("[Survey Enhancer]", ...args);
};

onExtensionMessage("store-changed", (changed) => {
    if (
        changed.namespace === "globals" &&
        changed.data.enableDebug !== undefined
    ) {
        enabled = changed.data.enableDebug;
    }
});

initDebug();

export default log;
