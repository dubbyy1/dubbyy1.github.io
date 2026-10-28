// The site's main screens, in the order you swipe through them (left to right).
// The arrows, arrow keys and touch swipes all move along this list.
// To add a screen: create the page in src/pages/ and add it here.
export interface Screen {
    path: string;
    name: string;
}

export const screens: Screen[] = [
    { path: "/left", name: "coming soon" },
    { path: "/", name: "home" },
    { path: "/right", name: "coming soon" },
];

// Builds see paths like "/right.html" or "/index.html"; the browser sees "/right" or "/".
const normalise = (path: string) =>
    path.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1") || "/";

export function screenIndex(path: string): number {
    return screens.findIndex((s) => s.path === normalise(path));
}

export function neighbours(path: string): { prev?: Screen; next?: Screen } {
    const i = screenIndex(path);
    if (i === -1) return {};
    return { prev: screens[i - 1], next: screens[i + 1] };
}

// Pages that sit "below" the screens: going into one slides the page up, coming back slides it down.
// They have no sideways arrows or swiping. Pages inside them (e.g. /projects/some-project) count too.
export const sections: string[] = ["/projects"];

// Pages that appear with a hard cut: no slide or fade going to or from them.
export const cuts: string[] = ["/y"];

export function isCut(path: string): boolean {
    return cuts.includes(normalise(path));
}

export function isSection(path: string): boolean {
    const p = normalise(path);
    return sections.some((s) => p === s || p.startsWith(s + "/"));
}
