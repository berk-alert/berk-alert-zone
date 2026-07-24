export type Pixel = {
    r: number;
    g: number;
    b: number;
}

export type Row = {
    pixels: Pixel[];
    width: number;
}

export type Image = {
    rows: Row[];
    width: number;
    height: number;
}


export function rotateClockwise(image: Image): Image {
    const oldRowsReversed = image.rows.reverse();
    const newRows: Row[] = [];
    for (let i = 0; i < image.width; i++) {
        const newRow: Pixel[] = [];
        for (let oldRow of oldRowsReversed) {
            newRow.push(oldRow.pixels[i]);
        }
        newRows.push({
            pixels: newRow,
            width: newRow.length,
        });
    }
    return {
        rows: newRows,
        width: image.height,
        height: image.width,
    }
}

// Shrink down to ~180 pixels on smallest dimension. Crops from right and bottom.
export function downsample(image: Image): Image {
    const scalingFactor = Math.round(Math.min(image.height, image.width) / 180);
    if (scalingFactor < 2) {
        return image;
    }

    const newRows: Row[] = [];

    for (let row = 0; row + scalingFactor < image.height; row += scalingFactor) {
        const newRow: Pixel[] = [];
        for (let col = 0; col + scalingFactor < image.width; col += scalingFactor) {
            let newRedTotal = 0;
            let newGreenTotal = 0;
            let newBlueTotal = 0;

            for (let dRow = 0; dRow < scalingFactor; dRow++) {
                for (let dCol = 0; dCol < scalingFactor; dCol++) {
                    const pixelToAverage = image.rows[row + dRow].pixels[col + dCol];
                    newRedTotal += pixelToAverage.r;
                    newGreenTotal += pixelToAverage.g;
                    newBlueTotal += pixelToAverage.b;
                }
            }

            const newPixel: Pixel = {
                r: Math.round(newRedTotal / (scalingFactor * scalingFactor)),
                g: Math.round(newGreenTotal / (scalingFactor * scalingFactor)),
                b: Math.round(newBlueTotal / (scalingFactor * scalingFactor)),
            }
            newRow.push(newPixel);
        }
        newRows.push({pixels: newRow, width: newRow.length});
    }
    return {
        rows: newRows,
        height: newRows.length,
        width: newRows[0].width,
    }
}


export function getBlankImage(height: number, width: number): Image {
    const image: Image = {rows: [], width, height};
    for (let row = 0; row < height; row += 1) {
        image.rows.push({pixels: [], width});
        for (let col = 0; col < width; col += 1) {
            image.rows[row].pixels.push({r: 0, g: 0, b: 0});
        }
    }
    return image;
}

export function deepCopyImage(image: Image) {
    const newImage: Image = {rows: [], width: image.width, height: image.height};
    for (let row = 0; row < image.height; row += 1) {
        newImage.rows.push({pixels: [], width: image.width});
        for (let col = 0; col < image.width; col += 1) {
            const oldPixel = image.rows[row].pixels[col];
            newImage.rows[row].pixels.push({r: oldPixel.r, g: oldPixel.g, b: oldPixel.b});
        }
    }
    return newImage;
}

// export function findDifference(a: Image, b: Image, affectedArea: Triangle): number {
//     const minX = Math.min(affectedArea.x1, affectedArea.x2, affectedArea.x3);
//     const maxX = Math.max(affectedArea.x1, affectedArea.x2, affectedArea.x3);
//     const minY = Math.min(affectedArea.y1, affectedArea.y2, affectedArea.y3);
//     const maxY = Math.max(affectedArea.y1, affectedArea.y2, affectedArea.y3);

//     let difference = 0;
//     for (let row = minY; row < maxY; row += 1) {
//         for (let col = minX; col < maxX; col += 1) {
//             const aPixel = a.rows[row].pixels[col];
//             const bPixel = b.rows[row].pixels[col];
//             difference += Math.abs(aPixel.r - bPixel.r);
//             difference += Math.abs(aPixel.g - bPixel.g);
//             difference += Math.abs(aPixel.b - bPixel.b);
//         }
//     }
//     return difference;
// }