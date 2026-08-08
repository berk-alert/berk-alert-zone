import { getPixelAt } from "./getpixels";
import { Image } from "./image";

export function toBuffer(image: Image): Uint8ClampedArray {
    const buffer = new Uint8ClampedArray(image.height * image.width * 4);
    let offset = 0;
    for (let row = 0; row < image.height; row += 1) {
        for (let col = 0; col < image.width; col += 1) {
            // This is a hack because the last row and column were never getting drawn
            const rowToUse = row == (image.height - 1) ? row - 1 : row;
            const colToUse = col == (image.width - 1) ? col - 1 : col;
            const pixel = getPixelAt(image, rowToUse, colToUse);
            if (pixel) {
                buffer[offset] = pixel.r;
                buffer[offset + 1] = pixel.g;
                buffer[offset + 2] = pixel.b;
                buffer[offset + 3] = 255;
            }
            offset += 4;
        }
    }
    return buffer;
}