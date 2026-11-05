// Achievements: which are unlocked, and progress towards the rest, kept in this browser.
// The list is in data/achievements.ts. Unlocking one slides a card in at the top right
// (components/AchievementToasts.astro), except on pages that turn that off (<Base achievements={false}>).
// pages/achievements.astro reads the same cookie, in a small script of its own: keep the two in step.
//
// They're saved in a cookie rather than localStorage because each address has its own localStorage,
// and the /y achievement is earned on y.dubbyy.com: a cookie for dubbyy.com is shared with all its
// subdomains (utils/cookies.ts).
import { achievements, type Achievement } from "../data/achievements";
import { readCookie, writeCookie } from "../utils/cookies";
import { reducedMotion } from "./settings";

const KEY = "achievements";
const SHOW_MS = 4000; // how long a card stays up
// On banners for achievements without a picture of their own (image in data/achievements.ts).
const DEFAULT_PICTURE = "/achievements/achievement-tri.png";

// Fetched as soon as a page that can unlock achievements loads, so a banner never waits on the network.
// Only in the browser: pages/achievements.astro also imports this file on the server (for STAR), where there's no Image.
if (typeof Image !== "undefined") {
    for (const src of new Set([DEFAULT_PICTURE, ...achievements.flatMap((a) => (a.image ? [a.image] : []))])) {
        new Image().src = src;
    }
}

interface State {
    unlocked: Record<string, number>; // id → when (ms since 1970)
    progress: Record<string, number | string[]>; // id → steps done, or the things collected so far
}

function load(): State {
    let saved = readCookie<Partial<State>>(KEY);
    // Saved before achievements moved to a cookie: carried over once.
    if (!saved) {
        try {
            const old = localStorage.getItem(KEY);
            if (old) {
                localStorage.removeItem(KEY);
                saved = JSON.parse(old);
                if (saved) save({ unlocked: saved.unlocked ?? {}, progress: saved.progress ?? {} });
            }
        } catch {}
    }
    return { unlocked: saved?.unlocked ?? {}, progress: saved?.progress ?? {} };
}

function save(state: State) {
    writeCookie(KEY, state);
}

// Forgets every achievement and all progress towards them (the reset on the settings page).
export function resetAchievements() {
    save({ unlocked: {}, progress: {} });
    try {
        localStorage.removeItem(KEY);
    } catch {}
}

export function unlock(id: string) {
    const state = load();
    if (state.unlocked[id]) return;
    state.unlocked[id] = Date.now();
    delete state.progress[id];
    save(state);
    const achievement = achievements.find((a) => a.id === id);
    if (achievement) announce(achievement);
}

// One more step towards an achievement with a goal; unlocks it on reaching the goal.
export function count(id: string) {
    const state = load();
    if (state.unlocked[id]) return;
    const goal = achievements.find((a) => a.id === id)?.goal ?? 1;
    const done = (typeof state.progress[id] === "number" ? state.progress[id] : 0) + 1;
    state.progress[id] = done;
    save(state);
    if (done >= goal) unlock(id);
}

// Ticks off one of a set of things (e.g. each project); unlocks the achievement once every one of `all` is in.
export function collect(id: string, item: string, all: string[]) {
    const state = load();
    if (state.unlocked[id]) return;
    const saved = state.progress[id];
    const have = new Set(Array.isArray(saved) ? saved : []);
    have.add(item);
    state.progress[id] = [...have];
    save(state);
    if (all.every((thing) => have.has(thing))) unlock(id);
}

// Banners wait their turn, one at a time.
const queue: Achievement[] = [];
let showing = false;

function announce(achievement: Achievement) {
    if (document.documentElement.hasAttribute("data-no-achievements")) return;
    queue.push(achievement);
    if (!showing) showNext();
}

async function showNext() {
    const achievement = queue.shift();
    const box = document.getElementById("achievement-toasts");
    if (!achievement || !box) {
        showing = false;
        return;
    }
    showing = true;
    // Unlocked while looking at another tab (e.g. a social link opened one): wait until they're back.
    if (document.hidden) {
        await new Promise<void>((back) =>
            document.addEventListener("visibilitychange", function seen() {
                if (document.hidden) return;
                document.removeEventListener("visibilitychange", seen);
                back();
            }),
        );
    }

    // The banner (styled in components/AchievementToasts.astro): name, how it was got, and its picture.
    // It's a link to every achievement.
    const card = document.createElement("a");
    card.className = "achievement-toast";
    card.href = "/achievements";
    card.innerHTML = `<div class="banner"><div><p class="name"><span class="visually-hidden">Achievement unlocked: </span></p><p class="how"></p></div></div>`;
    const banner = card.querySelector(".banner")!;
    card.querySelector(".name")!.append(achievement.title);
    card.querySelector(".how")!.textContent = achievement.description;
    const picture = document.createElement("img");
    picture.className = "picture";
    picture.src = achievement.image ?? DEFAULT_PICTURE;
    picture.alt = "";
    banner.append(picture);
    // Only once the picture is ready to draw: otherwise its turn can play out before it appears, and it
    // just pops in at the end. Usually instant (it was fetched when the page loaded); a broken file doesn't hold it up.
    await picture.decode().catch(() => {});
    box.append(card);

    // With reduced motion it just appears, stays, and goes.
    if (reducedMotion()) {
        await new Promise((wait) => setTimeout(wait, SHOW_MS));
        card.remove();
        showNext();
        return;
    }

    // In from the right, from just past the edge of the screen; back out the same way, a little quicker.
    // Both ease out: off the mark at once, then settling.
    const away = { transform: "translateX(calc(100% + 24px))" };
    const here = { transform: "none" };
    const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)"; // ease-out-quint
    // As it comes in, the picture turns a quarter, anticlockwise like something rolling in from the right.
    // It waits until the banner is mostly on screen and turns on a gentler curve, so the turn can be seen.
    // Then it rocks gently from side to side for as long as it's up, starting from where it landed.
    const turn = picture.animate([{ rotate: "60deg" }, { rotate: "0deg" }], {
        duration: 450,
        delay: 120,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)", // ease-out-cubic
        fill: "backwards",
    });
    // The rock swings like a pendulum: it only slows at either end, never in the middle.
    // It waits a moment after landing (delay), so the turn and the rock read as two separate movements.
    turn.finished.then(
        () =>
            picture.animate(
                [
                    { rotate: "0deg", easing: "cubic-bezier(0.61, 1, 0.88, 1)" }, // ease-out-sine: off the rest point
                    { rotate: "4deg", offset: 0.25, easing: "cubic-bezier(0.37, 0, 0.63, 1)" }, // ease-in-out-sine: end to end
                    { rotate: "-4deg", offset: 0.75, easing: "cubic-bezier(0.12, 0, 0.39, 0)" }, // ease-in-sine: back to rest
                    { rotate: "0deg" },
                ],
                { duration: 4000, delay: 400, iterations: Infinity },
            ),
        () => {},
    );
    await card.animate([away, here], { duration: 350, easing: EASE_OUT }).finished;
    await new Promise((wait) => setTimeout(wait, SHOW_MS));
    await card.animate([here, away], { duration: 280, easing: EASE_OUT, fill: "forwards" }).finished;
    card.remove();
    showNext();
}

// A five-pointed star with rounded points, on a 24×24 grid.
export const STAR =
    "M12 2.6c.4 0 .8.2 1 .6l2.4 4.9 5.4.8c.9.1 1.3 1.2.6 1.9l-3.9 3.8.9 5.4c.2.9-.8 1.6-1.6 1.2L12 18.6l-4.8 2.5c-.8.4-1.8-.3-1.6-1.2l.9-5.4-3.9-3.8c-.7-.7-.3-1.8.6-1.9l5.4-.8 2.4-4.9c.2-.4.6-.6 1-.6Z";
