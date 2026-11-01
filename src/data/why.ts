// The cards in the about page's "why" section (components/WhyCards.astro). One shows at a time;
// the button deals another at random. Add as many as you like, in any order.
//
// title:       the card's heading.
// description: a line or two about it.
// image:       optional. Put the picture in src/assets/ and import it at the top of this file.
// alt:         what the image shows, for people who can't see it. Leave it out if the image is just decoration.
import type { ImageMetadata } from "astro";

export interface WhyCard {
    title: string;
    description: string;
    image?: ImageMetadata;
    alt?: string;
}

export const cards: WhyCard[] = [
    { title: "Hitman World of Assassination", description: "One of my favourite games. I love optimising routes, and freelancer is addictive" },
    { title: "Music", description: "I spend most of my waking hours with an earbud in" },
    { title: "Hunter X Hunter", description: "Peak worldbuilding" },
];
