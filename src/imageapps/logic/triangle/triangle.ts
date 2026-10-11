export type Triangle = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
}

function randNum(max: number): number {
    const mainSwitch = Math.random()
    if (mainSwitch < 0.05) {
        return 0;
    } else if (mainSwitch > 0.95) {
        return max - 1;
    }
    return Math.floor(Math.random() * max);
}

// Get a mostly random triangle within the specified size
// ** Number will be weighted towards edges - see randNum for weighting
export function getRandomTriangle(maxHeight: number, maxWidth: number): Triangle {
    return {
        x1: randNum(maxWidth),
        y1: randNum(maxHeight),
        x2: randNum(maxWidth),
        y2: randNum(maxHeight),
        x3: randNum(maxWidth),
        y3: randNum(maxHeight)
    }
}

// Get a mostly random triangle within the specified size
// ** Number will be weighted towards edges - see randNum for weighting
// ** Max angle size of 140, min angle size of 15 
export function getNormalizedRandomTriangle(maxHeight: number, maxWidth: number): Triangle {
    // Pick all xs and ys
    const candidate = {
        x1: randNum(maxWidth),
        y1: randNum(maxHeight),
        x2: randNum(maxWidth),
        y2: randNum(maxHeight),
        x3: randNum(maxWidth),
        y3: randNum(maxHeight)
    }

    // If triangle is too much of a skinny boi, try again
    const aLength = sideLength(candidate.x1, candidate.y1, candidate.x2, candidate.y2);
    const bLength = sideLength(candidate.x2, candidate.y2, candidate.x3, candidate.y3);
    const cLength = sideLength(candidate.x3, candidate.y3, candidate.x1, candidate.y1);

    const aAngle = angle(aLength, bLength, cLength);
    const bAngle = angle(bLength, cLength, aLength);
    const cAngle = angle(cLength, aLength, bLength);

    if (aAngle < 15 || aAngle > 140 || bAngle < 15 || bAngle > 140 || cAngle < 15 || cAngle > 140) {
        return getNormalizedRandomTriangle(maxHeight, maxWidth);
    }

    return candidate;
}

// Get the length of the side between two points
function sideLength(x1: number, y1: number, x2: number, y2: number): number {
    const xDiff = Math.abs(x1 - x2);
    const yDiff = Math.abs(y1 - y2);
    return Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
}

// Use Law of Cosines to get the size of an angle in degrees given three sides
// cLength is the length of the opposite side, aLength and bLength are the lengths of the two adjacent sides
function angle(aLength: number, bLength: number, cLength: number): number {
    return Math.acos((aLength * aLength + bLength * bLength - cLength * cLength) / (2 * aLength * bLength)) * 180 / Math.PI;
}


/**
 * A utility function to calculate area of triangle formed by (x1, y1), (x2, y2) and (x3, y3)
 * Courtesy of GeeksForGeeks.org. Thank you GeeksForGeeks.org!!
 */
function area(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0);
}
 
/**
 * A function to check whether point P(x, y) lies inside the triangle formed by A(x1, y1), B(x2, y2) and C(x3, y3)
 * Courtesy of GeeksForGeeks.org. Thank you GeeksForGeeks.org!!
 */
export function isPointInTriangle(x: number, y: number, triangle: Triangle): boolean {
    let A = area (triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3);
 
    /* Calculate area of triangle PBC */
    let A1 = area (x, y, triangle.x2, triangle.y2, triangle.x3, triangle.y3);
     
    /* Calculate area of triangle PAC */
    let A2 = area (triangle.x1, triangle.y1, x, y, triangle.x3, triangle.y3);
     
    /* Calculate area of triangle PAB */   
    let A3 = area (triangle.x1, triangle.y1, triangle.x2, triangle.y2, x, y);
         
    /* Check if sum of A1, A2 and A3 is same as A */
    return (A == A1 + A2 + A3);
}