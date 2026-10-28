import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Projects: one Markdown file each in src/content/projects (files starting with _ are ignored).
// The front matter describes the project and the block it falls as on the projects page;
// the body will become the project's own page.
const colour = z.enum(["red", "blue", "green"]);

const block = z.discriminatedUnion("shape", [
    // Sizes are in px on a 1280-wide screen; the page scales them to fit.
    z.object({ shape: z.literal("rect"), width: z.number(), height: z.number() }),
    z.object({ shape: z.literal("circle"), size: z.number() }),
    // Any convex outline, as [x, y] corners going round the shape.
    z.object({ shape: z.literal("polygon"), points: z.array(z.tuple([z.number(), z.number()])).min(3) }),
]);

const projects = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/projects" }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            // Short, for the hover card on the projects page.
            description: z.string(),
            // Longer, under the title on the project's own page (defaults to the description).
            subtitle: z.string().optional(),
            date: z.coerce.date(),
            tags: z.array(z.string()).default([]),
            github: z.url().optional(),
            // "Try it" line under the subtitle, with its links.
            try: z.string().optional(),
            links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
            // Big video or image between the header and the write-up. Paths are from public/.
            hero: z
                .object({
                    video: z.string().optional(),
                    image: z.string().optional(),
                    poster: z.string().optional(),
                    alt: z.string().default(""),
                })
                .optional(),
            block: block.and(
                z.object({
                    colour: colour.default("green"),
                    // Shown over the block while it is hovered.
                    image: image().optional(),
                    // Text on the block; defaults to the title.
                    label: z.string().optional(),
                    labelSize: z.number().default(32),
                    // Tilt of the label inside the block, in degrees.
                    labelAngle: z.number().default(0),
                }),
            ),
        }),
});

export const collections = { projects };
