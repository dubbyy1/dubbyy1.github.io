// The achievements, in the order they're listed on /achievements (pages/achievements.astro).
// Unlocking one is done by the page it belongs to, with the functions in scripts/achievements.ts.
//
// id:          what the code unlocks it by. Don't change it once it's live, or people lose it.
// title:       its name, shown when it pops up and on the achievements page.
// description: how to get it.
// goal:        optional. For ones that take a number of steps (count() in scripts/achievements.ts):
//              how many. The page shows progress towards it.
// secret:      optional. Its description is hidden on the achievements page ("A secret achievement")
//              until it's unlocked; the title always shows.
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

export const achievements: Achievement[] = [
    {
        id: "pfp-clicks",
        title: "Leave me alone!",
        description: "Click the profile picture on the about page 10 times",
        goal: 10,
    },
    {
        // Its goal is however many projects there are (worked out in pages/achievements.astro).
        id: "all-projects",
        title: "Tour guide",
        description: "Visit every project's page",
    },
    {
        // One per link in components/SocialLinks.astro.
        id: "all-socials",
        title: "Social butterfly",
        description: "Click every social link on the home page",
        goal: 3,
    },
    {
        id: "password",
        title: "Smile",
        description: "Enter the right password on /y",
        secret: true,
    },
];
