// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  adapter: cloudflare(),
  // URLs have no trailing slash (/right, not /right/), so links never bounce through a redirect.
  trailingSlash: 'never',
  // Hide the Astro toolbar that the dev server shows at the bottom of the page.
  devToolbar: { enabled: false },
  build: { format: 'file' },
  // Load linked pages as soon as their links are on screen (e.g. the side arrows),
  // so clicking, arrow keys and swipes don't wait for the network.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});