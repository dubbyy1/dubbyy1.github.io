// Drops the project blocks (components/ProjectPile.astro) from above the screen and lets them pile up,
// using Matter.js. Each block element just mirrors its physics body's position and rotation.
// Returns a function that stops everything (called when leaving the page).
import Matter from "matter-js";
import { irisLinks } from "./iris";

const { Engine, Bodies, Body, Composite, Sleeping } = Matter;

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
const FIRST_DROP = 250; // ms after the page appears
const DROP_GAP = 220; // ms between blocks
const STEP = 1000 / 60;

// Blocks squash when they land and wobble back, so they look soft. The physics stays rigid; this is only drawn.
const SQUISH_PER_SPEED = 0.012; // how hard a hit squashes, per unit of impact speed
const SQUISH_MIN_SPEED = 1.5; // gentler bumps (like blocks settling against each other) don't squash
const SQUISH_MAX = 0.22; // most a block ever squashes, as a fraction of its size
const SQUISH_STIFFNESS = 0.2; // how quickly it springs back (per step)
const SQUISH_DAMPING = 0.2; // how quickly the wobble dies down (per step)

interface Block {
    el: HTMLElement;
    body: Matter.Body;
    cx: number; // balance point inside the element, in screen px
    cy: number;
    dropped: boolean;
    // Where the body was one step ago. Frames land between steps, so each one is drawn part way from here.
    prevX: number;
    prevY: number;
    prevAngle: number;
    squish: number; // how squashed it is right now along squishAngle (negative: stretched)
    squishSpeed: number;
    squishAngle: number; // direction of the last hit, in radians
}

export function startPile(root: HTMLElement): () => void {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Blocks are sized for a 1280×720 screen. Scale them by screen area, so a tall phone gets blocks
    // about as big as its width allows rather than shrinking to fit its narrow side.
    const byArea = Math.sqrt((innerWidth * innerHeight) / (DESIGN_WIDTH * DESIGN_HEIGHT));
    const s = Math.min(Math.max(Math.min(byArea, innerWidth / 520), 0.42), 1.25);
    root.style.setProperty("--s", String(s));
    root.classList.add("live");

    let width = root.clientWidth;
    let height = root.clientHeight;

    // More solver passes than Matter's defaults (6 and 4): stacked blocks settle firmly instead of trembling.
    // Cheap with only a handful of bodies.
    const engine = Engine.create({ enableSleeping: true, positionIterations: 12, velocityIterations: 10 });
    engine.gravity.y = 2.4;

    // Floor and side walls just outside the visible area. They reach far up so falling blocks stay in.
    const wall = { isStatic: true, friction: 0.6 };
    const floor = Bodies.rectangle(0, 0, 1, 1, wall);
    const left = Bodies.rectangle(0, 0, 1, 1, wall);
    const right = Bodies.rectangle(0, 0, 1, 1, wall);
    const placeWalls = () => {
        const t = 200;
        Body.setVertices(floor, Matter.Vertices.fromPath(`0 0 ${width * 3} 0 ${width * 3} ${t} 0 ${t}`, floor));
        Body.setPosition(floor, { x: width / 2, y: height + t / 2 });
        for (const [w, x] of [[left, -t / 2], [right, width + t / 2]] as const) {
            Body.setVertices(w, Matter.Vertices.fromPath(`0 0 ${t} 0 ${t} ${height * 6} 0 ${height * 6}`, w));
            Body.setPosition(w, { x, y: height - height * 3 });
        }
    };
    placeWalls();
    Composite.add(engine.world, [floor, left, right]);

    const els = [...root.querySelectorAll<HTMLElement>(".block")];
    // Shuffle so the pile comes out different each visit.
    for (let i = els.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [els[i], els[j]] = [els[j], els[i]];
    }

    const blocks: Block[] = els.map((el) => {
        const css = getComputedStyle(el);
        const num = (name: string) => parseFloat(css.getPropertyValue(name)) * s;
        const w = num("--w");
        const h = num("--h");
        const opts: Matter.IChamferableBodyDefinition = {
            restitution: 0.15,
            friction: 0.5,
            frictionAir: 0.012,
            sleepThreshold: 40,
        };
        let body: Matter.Body;
        if (el.dataset.shape === "circle") {
            body = Bodies.circle(0, 0, w / 2, opts);
        } else if (el.dataset.shape === "polygon") {
            const points: [number, number][] = JSON.parse(el.dataset.points!);
            body = Bodies.fromVertices(0, 0, [points.map(([x, y]) => ({ x: x * s, y: y * s }))], opts);
        } else {
            body = Bodies.rectangle(0, 0, w, h, { ...opts, chamfer: { radius: 5 * s } });
        }
        return {
            el,
            body,
            cx: num("--cx"),
            cy: num("--cy"),
            dropped: false,
            prevX: 0,
            prevY: 0,
            prevAngle: 0,
            squish: 0,
            squishSpeed: 0,
            squishAngle: 0,
        };
    });

    // A hit squashes the block along the direction it came from, harder the faster it was going.
    // A weaker hit doesn't interrupt a bigger wobble that's already happening.
    const byBody = new Map(blocks.map((b) => [b.body, b]));
    const hit = (b: Block | undefined, speed: number, angle: number) => {
        if (!b || speed < SQUISH_MIN_SPEED) return;
        const kick = Math.min(speed * SQUISH_PER_SPEED, SQUISH_MAX);
        if (kick <= Math.abs(b.squishSpeed) + Math.abs(b.squish) * Math.sqrt(SQUISH_STIFFNESS)) return;
        b.squishSpeed = kick;
        b.squishAngle = angle;
    };
    if (!reduceMotion) {
        Matter.Events.on(engine, "collisionStart", (e) => {
            for (const { bodyA, bodyB, collision } of e.pairs) {
                // Odd-shaped blocks are made of several parts; the block is their parent.
                const a = bodyA.parent;
                const b = bodyB.parent;
                const { normal } = collision;
                const speed = Math.abs(
                    (a.velocity.x - b.velocity.x) * normal.x + (a.velocity.y - b.velocity.y) * normal.y,
                );
                const angle = Math.atan2(normal.y, normal.x);
                hit(byBody.get(a), speed, angle);
                hit(byBody.get(b), speed, angle);
            }
        });
    }

    // One step of the spring that pulls each squashed block back into shape.
    const springBack = () => {
        for (const b of blocks) {
            b.squishSpeed -= SQUISH_STIFFNESS * b.squish + SQUISH_DAMPING * b.squishSpeed;
            b.squish = Math.min(Math.max(b.squish + b.squishSpeed, -SQUISH_MAX), SQUISH_MAX);
            if (Math.abs(b.squish) < 0.001 && Math.abs(b.squishSpeed) < 0.001) b.squish = b.squishSpeed = 0;
        }
    };

    // Start a block just above the screen at a random spot, tipped a little.
    // It must start clear of the others: Matter shoves overlapping bodies apart violently, which made
    // blocks fly about when one appeared on top of a block that hadn't fallen far yet.
    const SPAWN_GAP = 12;
    const clearOf = (body: Matter.Body, other: Matter.Body) =>
        body.bounds.max.x + SPAWN_GAP < other.bounds.min.x ||
        other.bounds.max.x + SPAWN_GAP < body.bounds.min.x ||
        body.bounds.max.y + SPAWN_GAP < other.bounds.min.y ||
        other.bounds.max.y + SPAWN_GAP < body.bounds.min.y;
    const drop = (b: Block, aboveBy = 0) => {
        const w = b.body.bounds.max.x - b.body.bounds.min.x;
        const h = b.body.bounds.max.y - b.body.bounds.min.y;
        const others = blocks.filter((o) => o.dropped).map((o) => o.body);
        Body.setAngle(b.body, (Math.random() - 0.5) * 0.8);
        // A few random spots first, so the pile still comes out mixed up.
        for (let i = 0; i < 8; i++) {
            const x = w / 2 + Math.random() * Math.max(width - w, 0);
            Body.setPosition(b.body, { x, y: -h / 2 - 20 - aboveBy });
            if (others.every((o) => clearOf(b.body, o))) break;
        }
        // Still on top of something: lift it above every block in its column. It just falls a little further.
        if (!others.every((o) => clearOf(b.body, o))) {
            const column = others.filter(
                (o) => o.bounds.min.x < b.body.bounds.max.x + SPAWN_GAP && b.body.bounds.min.x < o.bounds.max.x + SPAWN_GAP,
            );
            const top = Math.min(...column.map((o) => o.bounds.min.y));
            Body.setPosition(b.body, {
                x: b.body.position.x,
                y: b.body.position.y - (b.body.bounds.max.y - top + SPAWN_GAP),
            });
        }
        Body.setAngularVelocity(b.body, (Math.random() - 0.5) * 0.04);
        Composite.add(engine.world, b.body);
        remember(b);
        b.dropped = true;
        b.el.classList.add("dropped");
    };

    const remember = (b: Block) => {
        b.prevX = b.body.position.x;
        b.prevY = b.body.position.y;
        b.prevAngle = b.body.angle;
    };

    // `along` is how far this frame is between the last step and the next (0–1). Drawing there, rather
    // than snapping to the last step, keeps motion even when frames don't line up with steps (e.g. 120Hz screens).
    const render = (along = 1) => {
        const mix = (from: number, to: number) => from + (to - from) * along;
        for (const b of blocks) {
            if (!b.dropped) continue;
            const x = mix(b.prevX, b.body.position.x);
            const y = mix(b.prevY, b.body.position.y);
            const angle = mix(b.prevAngle, b.body.angle);
            let transform = `translate(${x - b.cx}px, ${y - b.cy}px)`;
            // Squashed along the hit, bulging out the other way so it keeps about the same size.
            if (b.squish) {
                const a = b.squishAngle;
                transform += ` rotate(${a}rad) scale(${1 - b.squish}, ${1 + b.squish}) rotate(${-a}rad)`;
            }
            b.el.style.transform = `${transform} rotate(${angle}rad)`;
        }
    };

    let frame = 0;
    let last = 0;
    let acc = 0;
    let simTime = 0; // ms of simulation run so far; drops are timed on this, so nothing piles up in a background tab
    let nextDrop = 0;
    let quietSince = -1;

    // Done once every block is in and the engine has put them all to sleep. A block that has
    // only just appeared isn't moving yet, so "slow" alone isn't enough. Anything still twitching
    // after a few quiet-ish seconds is left where it is.
    const settled = () => {
        if (nextDrop < blocks.length) return false;
        if (blocks.some((b) => b.squish || b.squishSpeed)) return false;
        if (blocks.every((b) => b.body.isSleeping)) return true;
        const slow = blocks.every((b) => b.body.speed < 0.05 && Math.abs(b.body.angularSpeed) < 0.002);
        if (!slow) quietSince = -1;
        else if (quietSince < 0) quietSince = simTime;
        return slow && simTime - quietSince > 3000;
    };

    // Fixed-step simulation so it behaves the same at 60Hz and 120Hz; stops once everything rests.
    const tick = (now: number) => {
        acc += Math.min(now - (last || now), 100);
        last = now;
        while (acc >= STEP) {
            while (nextDrop < blocks.length && simTime >= FIRST_DROP + nextDrop * DROP_GAP) drop(blocks[nextDrop++]);
            blocks.forEach(remember);
            Engine.update(engine, STEP);
            springBack();
            simTime += STEP;
            acc -= STEP;
        }
        const done = settled();
        // The last frame is drawn exactly where everything came to rest.
        render(done ? 1 : acc / STEP);
        frame = done ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
        if (frame) return;
        last = 0;
        acc = 0;
        quietSince = -1;
        frame = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
        // No falling: work out where the pile ends up and show that straight away.
        blocks.forEach((b, i) => drop(b, i * height * 0.6));
        nextDrop = blocks.length;
        for (let i = 0; i < 900; i++) Engine.update(engine, STEP);
        render();
    } else {
        wake();
    }

    // Keep the pile inside the screen when the window changes size.
    const onResize = () => {
        width = root.clientWidth;
        height = root.clientHeight;
        placeWalls();
        for (const b of blocks) {
            if (!b.dropped) continue;
            const { x, y } = b.body.position;
            Body.setPosition(b.body, { x: Math.min(Math.max(x, 0), width), y: Math.min(y, height) });
            remember(b); // moved, not travelled: don't draw it sliding across
            Sleeping.set(b.body, false);
        }
        reduceMotion ? render() : wake();
    };
    addEventListener("resize", onResize);

    const stopCard = hoverCard(root);
    const stopIris = irisLinks(root, s);

    return () => {
        cancelAnimationFrame(frame);
        removeEventListener("resize", onResize);
        stopCard();
        stopIris();
        Engine.clear(engine);
    };
}

// The dark card with a project's title, tags and description, following the pointer over a block.
function hoverCard(root: HTMLElement): () => void {
    const card = root.querySelector<HTMLElement>(".card");
    if (!card || !matchMedia("(hover: hover)").matches) return () => {};
    const title = card.querySelector(".card-title")!;
    const tags = card.querySelector(".card-tags")!;
    const description = card.querySelector(".card-description")!;

    let current: HTMLElement | null = null;

    const show = (block: HTMLElement) => {
        current = block;
        title.textContent = block.dataset.title ?? "";
        description.textContent = block.dataset.description ?? "";
        // [name, colour] pairs, coloured in data/tags.ts so a tag looks the same everywhere.
        const list: [string, string][] = JSON.parse(block.dataset.tags ?? "[]");
        tags.replaceChildren(
            ...list.slice(0, 2).map(([tag, colour]) => {
                const li = document.createElement("li");
                li.textContent = `#${tag}`;
                li.style.background = colour;
                return li;
            }),
        );
        if (list.length > 2) {
            const more = document.createElement("li");
            more.textContent = "…";
            more.style.background = "#7f849c"; // Catppuccin Mocha Overlay1
            tags.append(more);
        }
        card.hidden = false;
    };

    // Sit up and to the right of the pointer, flipping sides near the screen edges.
    const move = (e: PointerEvent) => {
        const gap = 14;
        const { width, height } = card.getBoundingClientRect();
        let x = e.clientX + gap;
        let y = e.clientY - gap - height;
        if (x + width > innerWidth - 8) x = e.clientX - gap - width;
        if (y < 8) y = e.clientY + gap;
        card.style.translate = `${x}px ${y}px`;
    };

    const onOver = (e: PointerEvent) => {
        const block = (e.target as Element).closest<HTMLElement>(".block");
        if (block && block !== current) show(block);
        if (!block) {
            current = null;
            card.hidden = true;
        }
        if (block) move(e);
    };
    const onMove = (e: PointerEvent) => current && move(e);
    const onLeave = () => {
        current = null;
        card.hidden = true;
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
        root.removeEventListener("pointerover", onOver);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
    };
}
