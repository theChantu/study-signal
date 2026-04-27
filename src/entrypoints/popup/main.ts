import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";

import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";

const app = mount(App, {
    target: document.getElementById("app")!,
});

export default app;
