import { Image, Pixel } from './image';
import * as jpeg from 'jpeg-js'

export function getPixelAt(image: Image, row: number, col: number): Pixel | undefined {
  if (row >= image.height || col >= image.width) {
    return undefined;
  }
  return image.rows[row].pixels[col];
}


export function decodeImage(source: ArrayBuffer): Image {
  const { width, height, data } = jpeg.decode(source, {useTArray: true});
  const buffer: Image = {rows: [], width, height};
  let offset = 0;
  for (let row = 0; row < height; row += 1) {
    buffer.rows.push({pixels: [], width});
    for (let col = 0; col < width; col += 1) {
      const newPixel: Pixel = {
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
      }
      buffer.rows[row].pixels.push(newPixel)
      offset += 4;
    }
  }
  return buffer;
}
