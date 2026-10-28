// Tag colours: every tag has one colour, used everywhere it appears (project pages, hover cards).
// The palette is Catppuccin Mocha's accents (https://catppuccin.com/palette), with its dark Base as text.
export const catppuccin = {
    rosewater: "#f5e0dc",
    flamingo: "#f2cdcd",
    pink: "#f5c2e7",
    mauve: "#cba6f7",
    red: "#f38ba8",
    maroon: "#eba0ac",
    peach: "#fab387",
    yellow: "#f9e2af",
    green: "#a6e3a1",
    teal: "#94e2d5",
    sky: "#89dceb",
    sapphire: "#74c7ec",
    blue: "#89b4fa",
    lavender: "#b4befe",
} as const;

export const tagText = "#1e1e2e"; // Catppuccin Mocha Base

// Picked by hand so related tags read well together. Add new tags here to choose their colour.
const chosen: Record<string, keyof typeof catppuccin> = {
    software: "blue",
    web: "sky",
    python: "yellow",
    "c++": "sapphire",
    svelte: "peach",
    astro: "mauve",
    linux: "rosewater",
    robotics: "teal",
    vex: "red",
    simulation: "lavender",
    gpu: "maroon",
    audio: "flamingo",
    spotify: "green",
    stardance: "pink",
};

// Any other tag gets a colour worked out from its name, so it is always the same one.
export function tagColour(tag: string): string {
    const name = tag.toLowerCase();
    if (chosen[name]) return catppuccin[chosen[name]];
    const colours = Object.values(catppuccin);
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return colours[hash % colours.length];
}
