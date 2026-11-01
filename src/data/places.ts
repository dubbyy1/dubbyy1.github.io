// The places on the about page's "where" map (components/WorldMap.astro). Each one is a pin;
// picking a pin shows its card under the map. The first place is the one shown when the map opens.
//
// name:    the place, shown on its card.
// coords:  [latitude, longitude]. Right-click the spot in Google Maps and click the numbers to copy them.
// caption: a line or two about it.
// image:   optional. Put the picture in src/assets/ and import it at the top of this file.
// alt:     what the image shows, for people who can't see it. Leave it out if the image is just decoration.
import type { ImageMetadata } from "astro";

export interface Place {
    name: string;
    coords: [number, number];
    caption: string;
    image?: ImageMetadata;
    alt?: string;
}

export const places: Place[] = [
    {
        name: "Dublin, Ireland",
        coords: [53.35, -6.26],
        caption: "home! 7/10",
    },
    {
        name: "Delphi, Ireland",
        coords: [53.63, -9.75],
        caption: "School 2025. Beautiful, surrounded by nature. 10/10",
    },
    {
        name: "Dallas, TX, U.S.A.",
        coords: [32.78, -96.8],
        caption: "VEX 2025. Pretty sad place, maybe we were just in a bad part. 4/10",
    },
    {
        name: "London, U.K.",
        coords: [51.51, -0.13],
        caption: "School 2026. London. 7/10",
    },
    {
        name: "Nigeria",
        coords: [6.45, 3.39],
        caption: "2025/26. Got to visit my family. 4/10 place but 10/10 for the people",
    },
    {
        name: "St. Louis, MO, U.S.A.",
        coords: [38.63, -90.20],
        caption: "VEX 2026. Nice city, nice people, no complaints. 8/10",
    },
    {
        name: "Sonthofen, Bavaria, Germany",
        coords: [47.52, 10.28],
        caption: "School 2024. Really beautiful, a lot of snow. 9/10",
    },
    {
        name: "Incheon, Republic of Korea",
        coords: [37.46, 126.71],
        caption: "FGC 2026. Really cool city, also very advanced. Made me realise how small Ireland is. 10/10",
    },
];
