// The events on the about page's "when" timeline (components/Timeline.astro).
// Add an event anywhere in the list: they're sorted by date, and a card for each new year is added automatically.
//
// date:    "2026-10-26" (shows "26 Oct"), "2026-10-??" (shows "Oct") or "2026-??-??" (no date card, just under
//          the year). "??" marks a part you don't know; leaving it off ("2026-10", "2026") works too.
// title:   the event's name.
// caption: a line or two about it.
// image:   optional. Put the picture in src/assets/ and import it at the top of this file.
// alt:     what the image shows, for people who can't see it. Leave it out if the image is just decoration.
import type { ImageMetadata } from "astro";
import vexVideos from "../assets/projects/vex-videos.gif";
import liveSeparator from "../assets/projects/live-separator.png";
import particleEvo from "../assets/projects/particle-evo.png";

export interface TimelineEvent {
    date: string;
    title: string;
    caption: string;
    image?: ImageMetadata;
    alt?: string;
}

// Newest first (true) or oldest first (false).
export const newestFirst = false;

export const events: TimelineEvent[] = [
    {
        date: "2010-01-24",
        title: "me!",
        caption: "I was born"
    },
    
    {
        date: "2019-09-??",
        title: "My first program",
        caption: "I wrote my very first lines of Java (big mistake). My first ever program was a [chatbot](https://github.com/dubbyy1), I was ahead of my time"
    },
    
    {
        date: "2025-11-??",
        title: "TECS",
        caption: "Took part in TECS, a competition run by Patch. I made a [2D game/simulation](https://github.com/dubbyy1/dollhouse) with LLM-powered characters. Wasn't too happy with it, but it was an interesting experience"
    },
    
    {
        date: "2025-05-06",
        title: "VEX 2025",
        caption: "Went to Dallas for the VEX V5 World Championships. First time in America, honestly not a great first impression. The trip was fun though"
    },
    
    {
        date: "2026-03-03",
        title: "Popstars",
        caption: "Played a lead role in my school's show. Had an amazing 3 days, something I couldn't even imagine doing a year ago"
    },
    
    {
        date: "2026-04-21",
        title: "VEX 2026",
        caption: "Went to St. Louis for the VEX V5 World Championships. We placed #41 in our division",
        image: vexVideos,
        alt: "An animation playing on the VEX Brain's screen",
    },
    
    {
        date: "2026-05-25",
        title: "Created dubbyy.com",
        caption: "Finally used the domain I had been sitting on for 7 months. It was ok.",
    },
    
    {
        date: "2026-06-05",
        title: "Stardance",
        caption: "Took part in Hack Club's Stardance Challenge. I coded for 112 hours over the summer, and won a free 3D printer!",
        image: particleEvo,
        alt: "Blue and pink particles forming cell-like rings in Particle Evolution",
    },
    
    {
        date: "2026-06-08",
        title: "Patch x OpenAI Young Builders Week",
        caption: "I was invited to a 5 day coding camp with Patch and OpenAI! Learnt a lot and met loads of amazing people. Probably the most impactful 5 days of my life"
    },
    
    {
        date: "2026-10-07",
        title: "FGC 2026",
        caption: "Spent a week in Korea a robotics competition. Placed #6 in the world. Probably my favourite trip so far. Good one to end on",
    },
    
    {
        date: "2026-10-26",
        title: "Rebuilt dubbyy.com",
        caption: "Wasn't happy with the old one, so I rebuilt it",
    },
];
