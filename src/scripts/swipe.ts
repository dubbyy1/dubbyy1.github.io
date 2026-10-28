// Drag sideways on a touchscreen and the page follows your finger, like flicking between phone home screens.
// Let go far enough (or flick fast enough) and the page carries on off-screen; the next screen then slides in
// over the plain background (see "in-left"/"in-right" in global.css). Otherwise it springs back.
// Sides with no screen give rubber-band resistance instead.

const COMMIT_DISTANCE = 0.25; // fraction of the screen width
const COMMIT_VELOCITY = 0.45; // px per ms
const AXIS_LOCK = 10; // px of movement before deciding sideways vs. scrolling
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type Direction = "prev" | "next";

export function enableSwipe(options: {
    enabled: () => boolean;
    hasNeighbour: (dir: Direction) => boolean;
    go: (dir: Direction) => void;
}) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        enableFlickOnly(options);
        return;
    }

    let startX = 0;
    let startY = 0;
    let dx = 0;
    let axis: "x" | "y" | null = null;
    let samples: { x: number; t: number }[] = [];
    let busy = false; // a release animation is running
    let tracking = false; // this touch started on a swipeable page

    const page = () => document.body;

    const setOffset = (x: number, transition = "none") => {
        const el = page();
        el.style.transition = transition;
        el.style.transform = x === 0 ? "" : `translate3d(${x}px, 0, 0)`;
    };

    // Past the last screen the page only moves a little, and less the further you pull.
    const resist = (x: number) => {
        const dir: Direction = x < 0 ? "next" : "prev";
        if (options.hasNeighbour(dir)) return x;
        const max = innerWidth * 0.12;
        return Math.sign(x) * max * (1 - Math.exp(-Math.abs(x) / (max * 2)));
    };

    document.addEventListener("touchstart", (e) => {
        axis = null;
        if (busy || e.touches.length > 1 || !options.enabled()) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dx = 0;
        tracking = true;
        samples = [{ x: startX, t: e.timeStamp }];
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
        if (busy || !tracking || e.touches.length > 1) return;
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;

        if (!axis) {
            const mx = Math.abs(x - startX);
            const my = Math.abs(y - startY);
            if (mx < AXIS_LOCK && my < AXIS_LOCK) return;
            axis = mx > my ? "x" : "y";
            // Start from where the finger is now, so the page doesn't jump by the lock distance.
            if (axis === "x") startX = x;
        }
        if (axis !== "x") return;

        dx = x - startX;
        samples.push({ x, t: e.timeStamp });
        if (samples.length > 5) samples.shift();
        setOffset(resist(dx));
    }, { passive: true });

    const springBack = () => setOffset(0, `transform 350ms ${EASE_OUT}`);

    const release = () => {
        tracking = false;
        if (busy || axis !== "x") return;
        axis = null;

        const first = samples[0];
        const last = samples[samples.length - 1];
        const velocity = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;

        const dir: Direction = dx < 0 ? "next" : "prev";
        const farEnough = Math.abs(dx) > innerWidth * COMMIT_DISTANCE;
        const fastEnough = Math.abs(velocity) > COMMIT_VELOCITY && Math.sign(velocity) === Math.sign(dx);

        if (dx !== 0 && (farEnough || fastEnough) && options.hasNeighbour(dir)) {
            // Carry on off-screen at roughly the finger's speed, then hand over to the next screen.
            const remaining = innerWidth - Math.abs(dx);
            const speed = Math.max(Math.abs(velocity), 1.5);
            const duration = Math.min(Math.max(remaining / speed, 120), 260);
            busy = true;
            const leaving = page();
            setOffset(Math.sign(dx) * innerWidth, `transform ${duration}ms ${EASE_OUT}`);
            setTimeout(() => {
                busy = false;
                options.go(dir);
                // If the next screen never arrives (e.g. offline), bring this one back.
                setTimeout(() => {
                    if (document.body === leaving) springBack();
                }, 3000);
            }, duration);
        } else {
            springBack();
        }
    };

    document.addEventListener("touchend", release, { passive: true });
    // The system interrupted the touch: never change screen, just settle back.
    document.addEventListener("touchcancel", () => {
        tracking = false;
        if (busy || axis !== "x") return;
        axis = null;
        springBack();
    }, { passive: true });
}

// With reduced motion the page doesn't move with the finger; a clear sideways swipe just changes screen.
function enableFlickOnly({ enabled, go }: { enabled: () => boolean; go: (dir: Direction) => void }) {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    document.addEventListener("touchstart", (e) => {
        tracking = enabled();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
        if (!tracking) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? "next" : "prev");
    }, { passive: true });
}
