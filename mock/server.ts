import { MOCK_HOST, MOCK_PORT } from "@/dev/mockHost";

const transpiler = new Bun.Transpiler({ loader: "ts" });

Bun.serve({
    hostname: MOCK_HOST,
    port: MOCK_PORT,
    async fetch(req) {
        const { pathname } = new URL(req.url);

        if (pathname === "/favicon.ico")
            return new Response(null, { status: 204 });

        if (pathname === "/harness.js") {
            const ts = await Bun.file(`${import.meta.dir}/harness.ts`).text();
            return new Response(transpiler.transformSync(ts), {
                headers: { "Content-Type": "application/javascript" },
            });
        }

        return new Response(Bun.file(`${import.meta.dir}/prolific.html`));
    },
});

console.log(
    `Prolific mock harness running at http://${MOCK_HOST}:${MOCK_PORT}/studies`,
);
