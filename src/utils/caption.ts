// Captions in the data files (timeline events, map places, why cards) are plain text that can hold
// Markdown-style links: "Took part in [Stardance](https://stardance.hackclub.com)". This turns one into
// HTML, with everything else kept as plain text. Links to other sites open in a new tab, as in Markdown.
import { isForeign } from "../plugins/external-links.mjs";

const escape = (text: string) =>
    text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Web and email addresses, and pages on this site. Anything else (e.g. "javascript:") stays as text.
const safe = (href: string) => /^(https?:\/\/|mailto:|\/|#)/i.test(href);

export function caption(text: string): string {
    return escape(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (link, label: string, href: string) => {
        const url = href.replaceAll("&amp;", "&");
        if (!safe(url)) return link;
        const newTab = isForeign(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escape(url)}"${newTab}>${label}</a>`;
    });
}
