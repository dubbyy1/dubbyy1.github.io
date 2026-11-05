// Shows the /y page on y.dubbyy.localhost:4321 while developing (the rules are in utils/hosts.ts).
// The live site is plain files with no code running, so there Cloudflare's own Rules do the same
// (see the README).
import { defineMiddleware } from "astro:middleware";
import { hostRoute } from "./utils/hosts";

export const onRequest = defineMiddleware((context, next) => {
    // Only while developing: the build renders every page ahead of time, with no address to go on.
    if (!import.meta.env.DEV) return next();
    const route = hostRoute(context.url);
    if (route && "redirect" in route) return context.redirect(route.redirect, 302);
    if (route && "rewrite" in route) return context.rewrite(route.rewrite);
    return next();
});
