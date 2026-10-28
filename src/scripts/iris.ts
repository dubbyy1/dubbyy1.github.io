// Clicking a project block: its colour grows out from inside the block until it fills the screen
// (like an iris opening), then fades away to reveal the project's page. A copy of the block's colour
// grows underneath the clicked block, while the block's own label fades out.
// The fade is the "iris" page transition in global.css, started by navigate(..., { info: "iris" }).
import { navigate } from "astro:transitions/client";

const GROW_MS = 520;
const GROW_EASE = "cubic-bezier(0.65, 0, 0.35, 1)"; // ease-in-out-cubic: on-screen shape changing size

export function irisLinks(root: HTMLElement, s: number): () => void {
    let busy = false;

    const onClick = (e: MouseEvent) => {
        const block = (e.target as Element).closest<HTMLAnchorElement>("a.block");
        if (!block || busy) return;
        // New tab, new window, download etc. stay as normal link clicks.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        e.preventDefault();
        busy = true;
        grow(block, s).then(() => navigate(block.href, { info: "iris" }));
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
}

function grow(block: HTMLElement, s: number): Promise<void> {
    const css = getComputedStyle(block);
    const num = (name: string) => parseFloat(css.getPropertyValue(name)) * s;
    const w = num("--w");
    const h = num("--h");
    const cx = num("--cx");
    const cy = num("--cy");

    // Same size, shape, place and rotation as the block, filled with its colour.
    const fill = document.createElement("div");
    fill.className = "iris";
    Object.assign(fill.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${w}px`,
        height: `${h}px`,
        background: block.dataset.fill ?? "#fff",
        clipPath: block.style.clipPath,
        transform: block.style.transform,
        transformOrigin: `${cx}px ${cy}px`,
        zIndex: "20",
        pointerEvents: "none",
        willChange: "transform",
    });
    block.style.zIndex = "21"; // the clicked block (and its label) stays on top of its own colour
    block.parentElement!.append(fill);
    block.closest(".pile")?.querySelector<HTMLElement>(".card")?.setAttribute("hidden", "");

    // How far to grow: until the narrowest part of the shape, measured from its centre,
    // reaches the farthest corner of the screen.
    const centre = new DOMPoint(cx, cy).matrixTransform(new DOMMatrix(block.style.transform));
    const reach = Math.max(
        ...[[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]].map(([x, y]) =>
            Math.hypot(x - centre.x, y - centre.y),
        ),
    );
    const scale = (reach / innerRadius(block, w, h, cx, cy, s)) * 1.05;

    const base = block.style.transform;
    const animation = fill.animate(
        [{ transform: `${base} scale(1)` }, { transform: `${base} scale(${scale})` }],
        { duration: GROW_MS, easing: GROW_EASE, fill: "forwards" },
    );
    // Meanwhile the block itself fades out. Its fill matches the colour underneath,
    // so what visibly fades is its label, leaving the screen all one colour.
    block.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: GROW_MS * 0.7,
        easing: "ease-out",
        fill: "forwards",
    });
    return animation.finished.then(() => {});
}

// Distance from the shape's centre to its nearest edge, in screen px.
function innerRadius(block: HTMLElement, w: number, h: number, cx: number, cy: number, s: number): number {
    if (block.dataset.shape === "circle") return w / 2;
    if (block.dataset.shape !== "polygon") return Math.min(w, h) / 2;
    const points: [number, number][] = JSON.parse(block.dataset.points!).map(([x, y]: number[]) => [x * s, y * s]);
    return Math.min(
        ...points.map(([x1, y1], i) => {
            const [x2, y2] = points[(i + 1) % points.length];
            return Math.abs((x2 - x1) * (y1 - cy) - (x1 - cx) * (y2 - y1)) / Math.hypot(x2 - x1, y2 - y1);
        }),
    );
}
