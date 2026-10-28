# dubbyy.com

Personal website. Astro + Svelte, deployed to Cloudflare.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in dist/
```

## Layout

- `src/pages/` — one file per page; the path is the URL.
- `src/layouts/Base.astro` — shell for every page: head tags, fonts, sideways page transitions, arrow-key and swipe navigation.
- `src/data/screens.ts` — the main screens in left-to-right order. The `<` `>` arrows, arrow keys and swipes follow this list.
- `src/components/` — `Logo` (each letter is its own path, ready to animate), `SocialLinks`, `ScreenArrows`.
- `src/styles/global.css` — colours, fonts, the slide animation.
- `src/assets/` — images that Astro optimises at build time.

## Adding things later

- **A new screen**: add a page in `src/pages/`, put `<ScreenArrows />` on it, add it to `src/data/screens.ts`.
- **Interactive pieces** (physics, characters, forms): a Svelte component in `src/components/`, used with `client:visible` or `client:load` so its JavaScript only loads on that page.
- **Server code** (e.g. the message board): add `export const prerender = false;` to a page or an API route in `src/pages/api/`. Everything else stays static.
