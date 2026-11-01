// Markdown links to other websites open in a new tab (a Sätteri hast plugin, see markdown.processor
// in astro.config.mjs). Links to this site's own pages are left alone, so they keep their page transitions.
const OWN_HOSTS = ["dubbyy.com", "www.dubbyy.com"];

// Also used for the links in captions (src/utils/caption.ts).
export const isForeign = (href) => {
    if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return false;
    try {
        return !OWN_HOSTS.includes(new URL(href).hostname);
    } catch {
        return false;
    }
};

/** @type {import("satteri").HastPluginDefinition} */
export default {
    name: "external-links",
    element: {
        filter: ["a"],
        visit(node, ctx) {
            if (!isForeign(node.properties?.href)) return;
            ctx.setProperty(node, "target", "_blank");
            // Stops the new tab reaching back to this page, and keeps where the visitor came from private.
            ctx.setProperty(node, "rel", ["noopener", "noreferrer"]);
        },
    },
};
