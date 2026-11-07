// The visitor's settings (the settings page, pages/settings.astro), saved in a cookie shared with y.dubbyy.com.
// Each one turned down is marked on <html>, so styles and scripts anywhere can follow it:
//   animations: "reduced" → data-motion="reduced"  no big movement: pages cut, blocks don't fall (reducedMotion())
//   animations: "off"     → data-motion="off"      nothing moves at all (global.css, and reducedMotion() below)
//   secrets: false        → data-secrets="off"     the home page's hand-drawn notes are hidden
//   physics: false        → data-physics="off"     the projects page's blocks sit in rows instead of falling
// layouts/Base.astro puts them on <html> before the page is drawn, reading the same cookie: keep the two in step.
import { readCookie, writeCookie } from "../utils/cookies";

const COOKIE = "settings";

// The animations slider's stops, left to right.
export const MOTION_LEVELS = ["off", "reduced", "full"] as const;
export type MotionLevel = (typeof MOTION_LEVELS)[number];

export interface Settings {
    animations: MotionLevel;
    secrets: boolean;
    physics: boolean;
}

const DEFAULTS: Settings = { animations: "full", secrets: true, physics: true };

const MARKS = { secrets: "secrets", physics: "physics" } as const;

export function getSettings(): Settings {
    const saved = readCookie<Partial<Omit<Settings, "animations">> & { animations?: MotionLevel | boolean }>(COOKIE);
    if (saved) {
        // Animations used to be a plain on/off switch.
        const { animations = DEFAULTS.animations } = saved;
        const level = animations === true ? "full" : animations === false ? "off" : animations;
        return { ...DEFAULTS, ...saved, animations: MOTION_LEVELS.includes(level) ? level : DEFAULTS.animations };
    }
    // Before there was a settings page, the home page's toggle kept the secrets choice in localStorage.
    let secrets = true;
    try {
        secrets = localStorage.getItem("drawings") !== "off";
    } catch {}
    return { ...DEFAULTS, secrets };
}

export function setSetting<K extends keyof Settings>(name: K, value: Settings[K]) {
    writeCookie(COOKIE, { ...getSettings(), [name]: value });
    applySettings();
}

// Marks the settings on <html>. Page changes swap in the new page's <html> attributes, so Base.astro calls this
// again after each one.
export function applySettings() {
    const settings = getSettings();
    const html = document.documentElement;
    if (settings.animations === "full") delete html.dataset.motion;
    else html.dataset.motion = settings.animations;
    for (const name of Object.keys(MARKS) as (keyof typeof MARKS)[]) {
        if (settings[name]) delete html.dataset[MARKS[name]];
        else html.dataset[MARKS[name]] = "off";
    }
}

// Whether to keep things still: animations are turned down in the settings, or the device asks for less motion.
export function reducedMotion(): boolean {
    return !!document.documentElement.dataset.motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
}
