# CLAUDE.md: dubbyy.com

dubbyy.com is a personal website. It's built with Astro 7 and Svelte and deployed to Cloudflare. The work in progress is on the `rebuild` branch.

Read these alongside this file:
- [AGENTS.md](AGENTS.md): dev server commands and links to the Astro docs.
- [README.md](README.md): page layout, and the `y.dubbyy.com` routing.

This file covers how the site should look and feel, and how the owner likes to work. It's distilled from the owner's own instructions, feedback and corrections. When they contradict an assumption, they win.

---

## Working with the owner

- **Change only what was asked, where it was asked.** If the target is ambiguous, ask first instead of guessing. Two past mistakes:
  - "Make the hero larger" meant the home page, not the page being worked on.
  - "Change the font weight to 500" meant the main Fredoka text only, not the Nunito text too.
- **Small follow-ups refine the last change.** "Make it 600" or "make it smaller" adjusts what was just done. It's not a new direction.
- **Explain non-obvious approaches before building them.** When a fix could go several ways, lay out the options with a recommendation and let the owner pick. For example, the map pins could be spread apart, zoomed, inset, made nearest-wins, or given arrows. The owner stopped work once to ask for exactly this.
- **Don't commit, push or pull unless asked.** Say what's uncommitted at the end of each task.
- **Don't assume the owner edited a file.** A "file changed on disk" notice usually comes from your own shell writes, or from another agent session working in the same folder. Check the diff before saying "you changed this".
- **Verify visually.** For anything visible, screenshot it in a browser at 1280×720 (the Figma frame size) and at phone width (375). Check that nothing scrolls sideways. Say plainly if something wasn't checked.
- **The dev server is often already running**, usually on `localhost:4321`, started by the owner or another session. Reuse it. It sometimes stops noticing changes to content collection files and serves stale data. If it does, tell the owner to restart it; don't kill a server you didn't start.
- **Leave tuning knobs.** For anything with a feel (timings, sizes, physics), put the numbers in clearly named constants or CSS custom properties near the top. Then tell the owner where they are.

### Files the owner drops in the project root
The owner often puts new assets in the project root (PNGs, `.webm` clips, sprites) and asks for them to be used. Move them where they belong rather than referencing them from the root:
- **Images Astro should optimise:** `src/assets/<area>/`.
- **Images referenced by plain URL:** `public/…`. That includes achievement pictures, project media and GIFs.

Use kebab-case names that match their use, and leave the originals alone unless they're moved. Krita backups (`*.png~`) are git-ignored.

---

## Visual identity

The site is playful, handmade and chunky, not corporate. Expect:
- a warm cream background;
- orange everywhere;
- dark-brown outlines;
- rounded shapes;
- hand-drawn sprites, drawn by the owner in Krita;
- a small orange triangle mascot.

**Avoid:**
- gradients and glassmorphism;
- generic UI-kit drop shadows;
- blue or purple.

**Flat is the default.** When the owner asks for something to "look better", don't add shadows or 3D edges. One pill got a brown edge underneath, and the owner sent it straight back: "no it should still be flat".

### Colours
These are in `src/styles/global.css`. Use the variables; don't invent new oranges.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#fff2e5` | cream background |
| `--ink` | `#1a0d00` | body text |
| `--orange` | `#ff8000` | headings, main accent |
| `--orange-mid` | `#ff952a` | fills, pills, banners, the "/page" label |
| `--orange-dark` | `#cc6500` | darker fills, links, the dropped last "y" |
| `--orange-soft` | `#ffb366` | light accents |
| `--brown` | `#613305` | outlines and titles on /settings and /achievements. Declared per page; reuse that value. |
| (red) | `#f95c5c` | destructive actions only, like the "reset" confirm button |

### Type
- **Fredoka Variable** for headings, titles and big labels:
  - page headings: weight **600**, `96 * --u`;
  - row titles, setting names and button labels: weight **500**, `35 * --u`.
- **Nunito Variable** for body text, descriptions, small pills and numbers:
  - descriptions on /achievements: weight **600**, `24 * --u`;
  - pills and small buttons on /settings: weight 700.
- **/settings is the reference for inner-page sizing and weights.** "Match /settings" is a recurring instruction, so new inner pages should copy its heading position, sizes and weights.

### Sizing: the unit system
- **`--px`** (global): one pixel of a 1920-wide screen, scaled to the current screen, with a minimum of 1280-wide. Everything scales with the screen, so the site looks the same on every computer.
- **Inner pages** (/settings, /achievements) set `--u: calc(1.25 * var(--px))` on `main`. That's one Figma design px, and the Figma frames are 1280×720.
- **Phones** (≤600px) get their own `--u` that shrinks until the widest thing fits, plus 16px side gutters.
- **Home** sizes its hero in logo units, inside a container. `--hero-scale: 1.2` in `index.astro` scales the hero together with the corner doodle and "The Board" / "Settings" labels.

### Drawing scale (important)
The owner draws every sprite at the same resolution, so every drawing must be shown at **one shared scale: 0.4 `--u` per pixel of the file**. That's half a screen pixel per file pixel at 1920 wide. Some examples:
- a 250px achievement picture is `100 * --u`;
- the bar's 250px triangle is 100 units;
- the unlock banner sizes its picture from the image's `naturalWidth` (the `--w` / `--picture` variables in `AchievementToasts.astro`).

When adding a drawing, work out its size from its file size; don't pick a size by eye.

**Exception:** /settings' sprites were drawn too big, so they're shown at 0.8 of that scale, using `--a: calc(0.8 * var(--u))` in `settings.astro`. Use the same approach for any future sprite the owner says was drawn at the wrong resolution, instead of resizing the file.

---

## Motion and interaction

- **Animations setting:** it has three levels, saved in a cookie by `scripts/settings.ts`.
  - **`full`:** the default.
  - **`reduced`:** pages cut instead of sliding, blocks don't fall, and the tagline doesn't roll. Small hover effects and the slider's magnet snap still play.
  - **`off`:** nothing moves.

  `html[data-motion]` reflects the setting, and `reducedMotion()` covers both the setting and `prefers-reduced-motion`. Every new animation must respect both.
- **Hover feedback:** buttons get a small hover response, a slight warm colour change plus a gentle sink (`scale: 0.97`). They press further on `:active` (`0.94`). Tick boxes do the same, slightly less (`0.98` / `0.96`). Put hover styles inside `@media (hover: hover) and (pointer: fine)`.
- **Timing:** hover transitions are about 150ms. The house ease-out curve is `cubic-bezier(0.23, 1, 0.32, 1)`. Keyboard actions apply instantly.
- **Labels:** labels that explain a control, like the slider's level, can show only on hover, drag or focus. Status that matters, like the achievements count "x / 5", is always visible.
- **Slider feel:** the slider behaves like a magnet.
  - Dragging pulls the knob toward the pointer while its stop pulls it back.
  - Crossing the midpoint between stops makes it shoot across fast, speeding up like a magnet grabbed by a stronger one, and land with a small squash. "Snap" means move very fast, not teleport.
  - The triangle knob rolls with its position: 0° at the start, 120° in the middle, 240° at the end, interpolated smoothly.
  - The lit part of the track follows the knob continuously.
- **Draggable things** (the /projects pile) must still open on a plain click. A press that became a drag never navigates.

---

## Page notes

- **Home (`index.astro`):**
  - The hero is 1.2× the design size.
  - The hand-drawn notes, called "secrets", can be hidden with the eye button or in settings.
  - Taglines come from `src/data/taglines.txt`. `| 5` at the end of a line weights it (`| 0` disables it), and `*stars*` make bold text.
  - Every tagline ends up in the page's HTML, so don't put anything secret in it.
- **/settings:**
  - Built from the owner's Figma frames: a magnet slider (off / reduced / full), Physics and Show Secrets tick boxes, and "Reset Achievements?" with an "Are you sure?" dialog.
  - No descriptions under the settings.
  - No shadow on the reset button.
  - The heading sits well clear of the controls.
- **/achievements:**
  - Matches /settings' heading.
  - Below the heading is a progress bar. It's a temporary SVG bar shaped like the slider: one outline around the tube, big rings at 0 and the end, small bumps at 1 and 3, and the line never passing through the circles. It's a bit wider than the heading.
  - The bar's knob is `progress-bar-tri.png`. The count sits in a flat, thin pill to the right of the bar's end.
  - Then comes a zigzag list: picture, then title and description, with no gap between picture and text. Locked rows show the padlock and "???".
  - Only the list scrolls; the page itself doesn't.
- **Achievements data (`src/data/achievements.ts`):**
  - Never change an `id` once it's live, or people lose their progress.
  - Titles can change freely. Goals that count things on the site (places, questions, projects) are worked out from the site, not hard-coded.
- **/me:**
  - Questions are `src/content/me/*.md`. `hidden: true` hides one without deleting it ("why" is hidden now).
  - Map pins pick the nearest pin to a click, and ‹ › arrows step through the places.
- **/projects and project pages:**
  - Each project is `src/content/projects/*.md`. See `_template.md` for the fields: `block.shape`, `colour`, `label`, `labelSize`, `image`.
  - In the body, wrap each paragraph in `<p>` and each picture in `<figure><img …></figure>`, with alt text.
  - External links open in a new tab. Subtitles can hold `[text](url)` links.
  - Keep GIFs reasonably small (a few MB): lower the frame rate, size and colours rather than shipping 20MB files.
- **/y** (served at `y.dubbyy.com`):
  - A deliberately un-smooth "secret terminal": black, monospace, white outlines, green (`#3d3`) for success, red italic "incorrect", and a white cursor. No fades on the prompt, so changes snap.
  - The password check is case-insensitive and uses only the hash.
  - After login, a short pause, then a "virtual desktop" with the face wallpaper fades in. The desktop itself isn't built yet; don't start it unasked.
