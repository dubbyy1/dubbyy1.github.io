// The visitor's settings (the settings page, pages/right.astro), saved in a cookie shared with y.dubbyy.com.
// Each one switched off is marked on <html>, so styles and scripts anywhere can follow it:
//   animations: false → data-motion="off"   nothing moves (global.css, and reducedMotion() below)
//   secrets: false    → data-secrets="off"  the home page's hand-drawn notes are hidden
//   physics: false    → data-physics="off"  the projects page's blocks sit in rows instead of falling
// layouts/Base.astro puts them on <html> before the page is drawn, reading the same cookie: keep the two in step.
import { readCookie, writeCookie } from "../utils/cookies";

const COOKIE = "settings";

export interface Settings {
    animations: boolean;
    secrets: boolean;
    physics: boolean;
}

const DEFAULTS: Settings = { animations: true, secrets: true, physics: true };

const MARKS: Record<keyof Settings, string> = { animations: "motion", secrets: "secrets", physics: "physics" };

export function getSettings(): Settings {
    const saved = readCookie<Partial<Settings>>(COOKIE);
    if (saved) return { ...DEFAULTS, ...saved };
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
    for (const name of Object.keys(MARKS) as (keyof Settings)[]) {
        if (settings[name]) delete document.documentElement.dataset[MARKS[name]];
        else document.documentElement.dataset[MARKS[name]] = "off";
    }
}

// Whether to keep things still: animations are off in the settings, or the device asks for less motion.
export function reducedMotion(): boolean {
    return document.documentElement.dataset.motion === "off" || matchMedia("(prefers-reduced-motion: reduce)").matches;
}
