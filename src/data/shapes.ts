// The shapes a project's block can be on the projects page. A project picks one by name
// (block.shape in its file in src/content/projects), along with a colour.
// Sizes are px on a 1280-wide screen; the page scales them to fit. Change a size here and every
// project using that shape changes with it. Polygons must be convex (no dents) for the physics.
// labelSize: the label's default size on that shape (otherwise 32); a project's own labelSize wins.

// An equilateral triangle with its point up, sides `side` long. A triangle narrows towards its point,
// so where the label sits it's only about two thirds as wide as its base: the label is smaller to fit.
const triangle = (side: number, labelSize: number) => {
    const h = Math.round(((side * Math.sqrt(3)) / 2) * 10) / 10;
    return { shape: "polygon" as const, points: [[0, h], [side / 2, 0], [side, h]] as [number, number][], labelSize };
};

export const shapes = {
    "big-circle": { shape: "circle", size: 221 },
    "small-circle": { shape: "circle", size: 158 },
    "tiny-circle": { shape: "circle", size: 110 },
    "big-triangle": triangle(300, 25),
    "small-triangle": triangle(200, 17),
    // Isosceles with the right angle at the bottom right, so the long side slopes up from the left.
    "big-right-triangle": { shape: "polygon", points: [[0, 300], [300, 0], [300, 300]] },
    // 1:2, standing up.
    "big-rectangle": { shape: "rect", width: 200, height: 400 },
    // 5:4, a bit smaller than the big one.
    "medium-rectangle": { shape: "rect", width: 290, height: 232 },
    "small-square": { shape: "rect", width: 140, height: 140 },
} as const;

export type ShapeName = keyof typeof shapes;
export const shapeNames = Object.keys(shapes) as [ShapeName, ...ShapeName[]];
