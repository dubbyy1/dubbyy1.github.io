// The /y page lives on its own subdomain: y.dubbyy.com. Locally the same pair is dubbyy.localhost:4321
// and y.dubbyy.localhost:4321 (browsers send any *.localhost address to this computer).
// On any other address (plain localhost, a preview link) /y is just an ordinary page.
//
// Used by src/middleware.ts on the dev server. The live site does the same with Cloudflare Rules
// (see the README): keep the two in step.

// The main addresses that have a y. subdomain beside them.
export const MAIN_HOSTS = ["dubbyy.com", "dubbyy.localhost"];

// The main address a hostname belongs to (dubbyy.com for y.dubbyy.com or www.dubbyy.com), if it's one of ours.
export function mainHost(hostname: string): string | undefined {
    const main = hostname.replace(/^(www|y)\./, "");
    return MAIN_HOSTS.includes(main) ? main : undefined;
}

// What to do with a request so /y and y.dubbyy.com line up:
// - y.dubbyy.com/   shows the /y page (the address stays y.dubbyy.com)
// - dubbyy.com/y    goes to y.dubbyy.com/
// (y.dubbyy.com/y is left alone: showing the /y page there is how the first rule works.)
export function hostRoute(url: URL): { rewrite: string } | { redirect: string } | undefined {
    const main = mainHost(url.hostname);
    if (!main) return;
    const onY = url.hostname === `y.${main}`;
    const path = url.pathname.replace(/\.html$/, "").replace(/(.)\/$/, "$1");
    if (onY && path === "/") return { rewrite: "/y" };
    if (!onY && path === "/y") {
        const y = new URL(url);
        y.hostname = `y.${main}`;
        y.pathname = "/";
        return { redirect: y.href };
    }
}
