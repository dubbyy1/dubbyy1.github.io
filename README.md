# dubbyy.com

Personal website. Astro + Svelte, deployed to Cloudflare.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in dist/
```

## y.dubbyy.com

The /y page lives at y.dubbyy.com. To try that locally, open the site at http://dubbyy.localhost:4321 instead of localhost: the last y in the logo then goes to http://y.dubbyy.localhost:4321. On plain localhost, /y is just a normal page.

Locally the rules are in `src/utils/hosts.ts`, applied by `src/middleware.ts`. The live site is plain files with no code running, so Cloudflare does the same with two Rules, set up once in the dashboard:

1. **The subdomain.** Workers & Pages → `dubbyy` → Settings → Domains & Routes → Add → Custom domain: `y.dubbyy.com`.
2. **Show /y on it.** Rules → Create rule → URL Rewrite Rule. When incoming requests match: Hostname equals `y.dubbyy.com` *and* URI Path equals `/`. Then: Path → Rewrite to → Static → `/y`.
3. **Send dubbyy.com/y there.** Rules → Create rule → Redirect Rule. When incoming requests match: Hostname equals `dubbyy.com` *and* URI Path equals `/y`. Then: Static URL `https://y.dubbyy.com/`, status 302.

Achievements are saved in a cookie for `dubbyy.com`, which y.dubbyy.com can read too, so the /y achievement shows on the main site.

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
