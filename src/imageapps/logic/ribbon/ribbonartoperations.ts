import { deepCopyImage, Image } from '../image';
import { rasterizeLine, setInitialPixelsForRibbon } from './bresenhamalgorithm';
import { areSameRibbon, RibbonPosition } from './ribbonposition';


export function getBoundaryPoints(controlImage: Image): [number, number][] {
    const boundaryPoints: [number, number][] = [];

    const maxX = controlImage.width - 1;
    const maxY = controlImage.height - 1;
    
    const xAxisDistanceBetweenPoints = Math.round(maxX / 18); // probably want to go up once we've figured out performance
    for (let i = xAxisDistanceBetweenPoints; i < maxX; i += xAxisDistanceBetweenPoints) {
        boundaryPoints.push([i, 0], [i, maxY]);
    }
    const yAxisDistanceBetweenPoints = Math.round(maxY / 18); // probably want to go up once we've figured out performance
    for (let i = yAxisDistanceBetweenPoints; i < maxY; i += yAxisDistanceBetweenPoints) {
        boundaryPoints.push([0, i], [maxX, i]);
    }

    boundaryPoints.push([0, 0], [0, maxY], [maxX, 0], [maxX, maxY]);

    return boundaryPoints;

}

// Just for debugging
export function getHighlightedBoundaryPoints(controlImage: Image): Image {
    const boundaryPoints = getBoundaryPoints(controlImage);
    const highlightedImage = deepCopyImage(controlImage);

    for (let [col, row] of boundaryPoints) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            for (let dRow = -1; dRow <= 1; dRow++) {
                if (col + dCol >= 0 && col + dCol < controlImage.height && row + dRow >= 0 && row + dRow < controlImage.width) {
                    highlightedImage.rows[row + dRow].pixels[col + dCol] = {
                        r: 0,
                        g: 255,
                        b: 0,
                    }
                }
            }
        }
    }
    return highlightedImage;
}

// just for debugging
export function getHighlightedRibbonLines(controlImage: Image): Image {
    const initialRibbonPositions = getInitialRibbonPositions(controlImage, 1);
    const highlightedImage = deepCopyImage(controlImage);
    for (let ribbon of initialRibbonPositions) {
        for (let [col, row] of ribbon.getPixelPositions()) {
            highlightedImage.rows[row].pixels[col] = {
                r: 0,
                g: 255,
                b: 0,
            }
        }
    }
    return highlightedImage;
}

export function getInitialRibbonPositions(controlImage: Image, swatchSize = 10): RibbonPosition[] {
    const ribbonPositions: RibbonPosition[] = [];
    const boundaryPoints = getBoundaryPoints(controlImage);
    const startingTime = Date.now();
    for (let p1 of boundaryPoints) {
        for (let p2 of boundaryPoints) {
            if (p1[0] == p2[0] && p1[1] == p2[1]) {
                continue;
            }
            // TODO can skip if we've already added RibbonPosition(p2, p1)
            const uninitializedRibbon = new RibbonPosition(p1, p2);
            const initializedRibbon = setInitialPixelsForRibbon(controlImage, uninitializedRibbon, swatchSize);
            ribbonPositions.push(initializedRibbon);
            const currentTime = Date.now();
            const totalSeconds = Math.round((currentTime - startingTime) / 1000);
            const averageSeconds = Math.round(totalSeconds / ribbonPositions.length);
            console.log(`Added ribbon #${ribbonPositions.length} (total: ${totalSeconds}s, avg: ${averageSeconds}s)`);
        }
    }
    return ribbonPositions;
}

export function pickAndApplyRibbon(ribbonImageSoFar: Image, ribbonPositions: RibbonPosition[]): [Image, RibbonPosition[]] {
    // Pick the ribbon to apply
    let bestRibbonPositionSoFar = ribbonPositions[0];
    let bestRibbonPositionScoreSoFar = Number.MAX_SAFE_INTEGER;
    for (let ribbonPosition of ribbonPositions) {
        const deviationScore = ribbonPosition.getDeviationFromAverageColor(3);
        if (deviationScore < bestRibbonPositionScoreSoFar) {
            bestRibbonPositionSoFar = ribbonPosition;
            bestRibbonPositionScoreSoFar = deviationScore;
        }
    }

    // Apply the ribbon to the image
    const newImage = applyRibbonToImage(ribbonImageSoFar, bestRibbonPositionSoFar);

    // Update other ribbons as needed
    const newRibbons = ribbonPositions.flatMap((ribbonPosition) => {
        if (areSameRibbon(ribbonPosition, bestRibbonPositionSoFar)) {
            // Don't update the ribbon we just applied (because we need it for updating other ribbons), and don't include it in the 
            // list of potential ribbons for next round
            return [];
        } else {
            // Remove the pixels that are now 'claimed' in this round, and only consider the ribbon next round if it's non-empty
            const tmpOldSize = ribbonPosition.getSize();
            ribbonPosition.removeUnsetPixels(bestRibbonPositionSoFar.getPixelPositions());
            const tmpNewSize = ribbonPosition.getSize();
            if (ribbonPosition.getSize() > 0) {
                return [ribbonPosition];
            } else {
                return [];
            }
        }
    });
    return [newImage, newRibbons];

}

function applyRibbonToImage(ribbonImageSoFar: Image, ribbonToApply: RibbonPosition): Image {
    const color = ribbonToApply.getAverageColor();
    for (let [col, row] of ribbonToApply.getPixelPositions()) {
        ribbonImageSoFar.rows[row].pixels[col] = color;
    }
    return ribbonImageSoFar;
}

// TODO not convinced this is needed long term, just for prototyping
export function applyInitialRibbonShapes(controlImage: Image): Image {
    const boundaryPoints = getBoundaryPoints(controlImage);
    const newImage = deepCopyImage(controlImage);
    
    return applyBoundaryLines(newImage, boundaryPoints);
}

// TODO probably not needed long term, just for prototyping
function applyBoundaryLines(image: Image, boundaryPoints: [number, number][]): Image {
    let computed = 0;
    let skipped = 0;
    for (let p1 of boundaryPoints) {
        for (let p2 of boundaryPoints) {
            if (p1[0] > p2[0]) {
                skipped += 1;
                continue;
            } else if (p1[0] == p2[0] && p1[1] > p2[1]) {
                skipped += 1;
                continue;
            }
            computed += 1;
            rasterizeLine(image, p1, p2);
        }
    }
    console.log(`Possibe: ${boundaryPoints.length * boundaryPoints.length}, computed: ${computed}, skipped: ${skipped}`);
    return image;
}