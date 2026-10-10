import { deepCopyImage, Image, Pixel } from "../image";
import { getNormalizedRandomTriangle, isPointInTriangle, Triangle } from "./triangle";

// Gets a color from the center of the triangle
function centerColorVal(controlImage: Image, triangle: Triangle): Pixel {
    const centerX = Math.floor((triangle.x1 + triangle.x2 + triangle.x3) / 3);
    const centerY = Math.floor((triangle.y1 + triangle.y2 + triangle.y3) / 3);
    try {
        return controlImage.rows[centerY].pixels[centerX];
    } catch {
        debugger;
        return controlImage.rows[0].pixels[0];
    }
}


// Gets a color from anywhere in the image
var allowedColors: Pixel[] | undefined = undefined;
function randColorVal(controlImage: Image): Pixel {
    if (allowedColors == undefined) {
        allowedColors = [];
        for (let row = 0; row < controlImage.height; row += 1) {
            for (let col = 0; col < controlImage.width; col += 1) {
                allowedColors.push(controlImage.rows[row].pixels[col]);
            }
        }
        allowedColors = [...new Set(allowedColors)];
    }
    const colorIndex = Math.floor(Math.random() * allowedColors.length);
    return allowedColors[colorIndex];
}


export function applyRandomTriangle(image: Image, controlImage: Image): [Image, Triangle] {
    const newImage = deepCopyImage(image);
    const randomTriangle = getNormalizedRandomTriangle(image.height, image.width);
    const randomColor = centerColorVal(controlImage, randomTriangle);

    const minX = Math.min(randomTriangle.x1, randomTriangle.x2, randomTriangle.x3);
    const maxX = Math.max(randomTriangle.x1, randomTriangle.x2, randomTriangle.x3);
    const minY = Math.min(randomTriangle.y1, randomTriangle.y2, randomTriangle.y3);
    const maxY = Math.max(randomTriangle.y1, randomTriangle.y2, randomTriangle.y3);
    
    for (let row = minY; row < maxY; row += 1) {
        for (let col = minX; col < maxX; col += 1) {
            if (isPointInTriangle(col, row, randomTriangle)) {
                newImage.rows[row].pixels[col] = {
                    r: randomColor.r,
                    g: randomColor.g,
                    b: randomColor.b,
                }
            }
        }
    }

    return [newImage, randomTriangle];
}

export function isBetter(control: Image, bssf: Image, candidate: Image, affectedArea: Triangle): boolean {
    const bssfDiff = findDifference(control, bssf, affectedArea);
    const candidateDiff = findDifference(control, candidate, affectedArea);
    return candidateDiff <= bssfDiff;
}



export function findDifference(a: Image, b: Image, affectedArea: Triangle): number {
    const minX = Math.min(affectedArea.x1, affectedArea.x2, affectedArea.x3);
    const maxX = Math.max(affectedArea.x1, affectedArea.x2, affectedArea.x3);
    const minY = Math.min(affectedArea.y1, affectedArea.y2, affectedArea.y3);
    const maxY = Math.max(affectedArea.y1, affectedArea.y2, affectedArea.y3);

    let difference = 0;
    for (let row = minY; row < maxY; row += 1) {
        for (let col = minX; col < maxX; col += 1) {
            const aPixel = a.rows[row].pixels[col];
            const bPixel = b.rows[row].pixels[col];
            difference += Math.abs(aPixel.r - bPixel.r);
            difference += Math.abs(aPixel.g - bPixel.g);
            difference += Math.abs(aPixel.b - bPixel.b);
        }
    }
    return difference;
}

// Further optimizations:
/**
 * Apply triangle as a weighted average
 *      - Maybe not if old pixel is black
 */

// Cool features to add:
/**
 * Timer
 * Start/Pause/Restart buttons
 * Parameterize things
 *   - Blur Amount (1-10 scale)
 *   - Opacity of new triangles (1-100 scale)
 *   - Regularization of new triangles (1-5 scale)
 *   - Color selection (random, sampled from image, smart select)
 */