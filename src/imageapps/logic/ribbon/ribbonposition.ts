import { Pixel } from "../image";


export function areSameRibbon(a: RibbonPosition, b: RibbonPosition) {
    return (a.p1[0] == b.p1[0]) && (a.p1[1] == b.p1[1]) && (a.p2[0] == b.p2[0]) && (a.p2[1] == b.p2[1]);
}

export class RibbonPosition {
    /**
     * Maps from columns to a map of row : Pixel. Obv  we'd prefer to map from (col, row) to pixel, but javascript map key equality doesn't work well there.
     * 
     * This holds the pixels from the original image that haven't yet been set on the ribbon-ized image.
     */
    private unsetPixels: Map<number, Map<number, Pixel>> = new Map();

    private cachedAverageColor: Pixel | undefined = undefined;
    private cachedDeviationScore: number | undefined = undefined;
    private cachedSize: number | undefined = undefined;
    private cachedPositions: [number, number][] | undefined = undefined;

    constructor(
        public p1: [number, number],
        public p2:  [number, number],
    ) {}

    /**
     * param is [column, row, pixel]
     * 
     * Used when initializing the ribbon position
     */
    public addUnsetPixels(pixels: [number, number, Pixel][]) {
        for (let [col, row, pixel] of pixels) {
            if (this.unsetPixels.get(col)) {
                this.unsetPixels.get(col)?.set(row, pixel);
            } else {
                this.unsetPixels.set(col, new Map([[row, pixel]]));
            }
        }
        // Should be no-op in practice, no one should be populating cache with queries until we've finished initializing
        this.cachedAverageColor = undefined;
        this.cachedDeviationScore = undefined;
        this.cachedSize = undefined;
        this.cachedPositions = undefined;
    }

    /**
     * param is [column, row]
     * 
     * Used when another ribbon position has claimed a spot
     */
    public removeUnsetPixels(positions: [number, number][]) {
        let wasSomethingDeleted = false;
        for (let [col, row] of positions) {
            if (this.unsetPixels.get(col)) {
                wasSomethingDeleted = !!this.unsetPixels.get(col)?.delete(row) || wasSomethingDeleted;
            }
        }
        if (wasSomethingDeleted) {
            this.cachedAverageColor = undefined;
            this.cachedDeviationScore = undefined;
            this.cachedSize = undefined;
            this.cachedPositions = undefined;
        }
    }

    public getSize(): number {
        if (this.cachedSize != undefined) {
            return this.cachedSize;
        }
        const size = [...this.unsetPixels.values()].map((foo) => foo.size).reduce((soFar, next) => soFar + next, 0);
        this.cachedSize = size;
        return size;
    }

    public getPixelPositions(): [number, number][] {
        if (this.cachedPositions != undefined) {
            return this.cachedPositions;
        }
        const positions =  [...this.unsetPixels.entries()].flatMap(([col, v]) => {
            return [...v.keys()].map((row) => [col, row] as [number, number]);
        });
        this.cachedPositions = positions;
        return positions;
    }

    public getAverageColor(): Pixel {
        if (this.cachedAverageColor != undefined) {
            return this.cachedAverageColor;
        }

        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;
        let totalCount = 0;
        for (let pixel of [...this.unsetPixels.values()].flatMap((foo) => [...foo.values()])) {
            // TODO somehow we're getting undefined pixels here when height > width on the base image. Definately
            //  related to how we're setting the unset pixels
            if (pixel === undefined) {
                debugger;
            }
            totalRed += pixel.r;
            totalGreen += pixel.g;
            totalBlue += pixel.b;
            totalCount += 1;
        }
        const averageColor = {
            r: Math.round(totalRed / totalCount),
            g: Math.round(totalGreen / totalCount),
            b: Math.round(totalBlue / totalCount),
        }
        this.cachedAverageColor = averageColor;
        return averageColor;
    }

    /**
     * Distance penalty to be used during prototyping, should eventually be de-parameterized or set by the user
     */
    public getDeviationFromAverageColor(distancePenalty: 2 | 3 | 4): number {
        if (this.cachedDeviationScore != undefined) {
            return this.cachedDeviationScore;
        }

        const averageColor = this.getAverageColor();
        let deviationScore = 0;
        for (let pixel of [...this.unsetPixels.values()].flatMap((foo) => [...foo.values()])) {
            const redDeviation = Math.abs(pixel.r - averageColor.r);
            const greenDeviation = Math.abs(pixel.g - averageColor.g);
            const blueDeviation = Math.abs(pixel.b - averageColor.b);
            deviationScore += Math.pow(redDeviation, distancePenalty);
            deviationScore += Math.pow(greenDeviation, distancePenalty);
            deviationScore += Math.pow(blueDeviation, distancePenalty);
        }
        const normalizedDeviationScore = Math.round(deviationScore / this.getSize());
        this.cachedDeviationScore = normalizedDeviationScore;
        return normalizedDeviationScore;
    }
}