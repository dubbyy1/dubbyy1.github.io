// The achievements, in the order they're listed on /achievements (pages/achievements.astro).
// Unlocking one is done by the page it belongs to, with the functions in scripts/achievements.ts.
//
// id:          what the code unlocks it by. Don't change it once it's live, or people lose it.
// title:       its name, shown when it pops up and on the achievements page.
// description: how to get it.
// goal:        optional. For ones that take a number of steps (count() in scripts/achievements.ts):
//              how many. The page shows progress towards it.
// secret:      optional. Kept for marking ones that are hidden on purpose. (The achievements page now shows
//              "???" under every locked one, secret or not; the title always shows.)
// image:       optional. Its picture, on the banner that pops up and on the achievements page; without one,
//              the banner has the triangle (public/achievements/achievement-tri.png). Put the file in
//              public/achievements/ and give its path from there, like "/achievements/poke.png".
//              Roughly square, with a transparent background, works best.
export interface Achievement {
    id: string;
    title: string;
    description: string;
    goal?: number;
    secret?: boolean;
    image?: string;
}

// Ones with no goal here that count something get theirs in pages/achievements.astro, worked out from the site.
export const achievements: Achievement[] = [
    {
        // One per link in components/SocialLinks.astro.
        id: "all-socials",
        title: "Social Butterfly",
        description: "Click every social link",
        goal: 3,
        image: "/achievements/social-butterfly.png",
    },
    {
        // Every place's card seen on the about page's map (components/WorldMap.astro); one per place.
        id: "all-places",
        title: "Well Travelled",
        description: "Visit every location on the map",
        image: "/achievements/well-travelled.png",
    },
    {
        // Every question on the about page looked at (pages/me.astro); one per question that's showing.
        id: "about-questions",
        title: "Why?",
        description: "Explore the about page",
        image: "/achievements/why.png",
    },
    {
        // One per project.
        id: "all-projects",
        title: "Building Blocks",
        description: "Visit every project",
        image: "/achievements/building-blocks.png",
    },
    {
        id: "password",
        title: "Smile.",
        description: "Find the password",
        secret: true,
        image: "/achievements/smile.png",
    },
];
