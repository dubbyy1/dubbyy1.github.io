// Cookies holding JSON, for things the visitor's browser remembers (achievements, settings).
// On our own addresses they're set for the main one (dubbyy.com), so its subdomains like y.dubbyy.com
// share them; anywhere else they belong to the page's own address. They last ten years.
import { mainHost } from "./hosts";

const KEEP_SECONDS = 10 * 365 * 24 * 60 * 60;

export function readCookie<T>(name: string): T | undefined {
    try {
        const cookie = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
        return cookie ? JSON.parse(decodeURIComponent(cookie.slice(name.length + 1))) : undefined;
    } catch {
        return undefined;
    }
}

export function writeCookie(name: string, value: unknown) {
    const main = mainHost(location.hostname);
    document.cookie = [
        `${name}=${encodeURIComponent(JSON.stringify(value))}`,
        "Path=/",
        `Max-Age=${KEEP_SECONDS}`,
        "SameSite=Lax",
        main && `Domain=${main}`,
        location.protocol === "https:" && "Secure",
    ]
        .filter(Boolean)
        .join("; ");
}
