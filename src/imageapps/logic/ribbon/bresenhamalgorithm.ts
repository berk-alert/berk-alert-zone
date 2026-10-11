import { Image } from "../image";  
import { RibbonPosition } from "./ribbonposition";


// Shamelessly stolen (then adapted) from https://github.com/mykolav/typescript-bresenham by mykolav.

class Line {
    private _isSlopeNormalized = false;
    
    private _dx: number;
    private _dy: number;
    
    constructor(
        public x0: number, 
        public y0: number, 
        public x1: number, 
        public y1: number) {

        // It's important to call normalizeSlope() before normalize()
        // as normalizeSlope can swap the coordinates of line's endpoints
        // and this swapping can result in a "denormalization" of the line.
        this.normalizeSlope();
        this.normalize();

        this._dy = this.y1 - this.y0;
        this._dx = this.x1 - this.x0;
    }
    
    private normalize() {
        if (this.x0 > this.x1) {
            let temp = this.x0;
            this.x0 = this.x1;
            this.x1 = temp;
            
            temp = this.y0;
            this.y0 = this.y1;
            this.y1 = temp;
        }
    }
    
    private normalizeSlope() {
        
        this._isSlopeNormalized = false;
        
        // The slope of a line is considered to be steep when its value is greater than 1
        // The slope calculation formulae is the following:
        // slope = dy / dx
        // In case dy is greater than dx, the slope is greater than 1 (steep)
        const dx = Math.abs(this.x1 - this.x0);
        const dy = Math.abs(this.y1 - this.y0);
        
        const isSteep = dy > dx;
        if (isSteep) {
            // So, the slope is steep.
            // We swap x0 <=> y0, x1 <=> y0.
            // As a result, we "mirror" the line over the straight line
            // going through the centre of coordinates at 45 degree angle. 
            // And so the slope of this "mirrored" line is not steep anymore.
            // (The line is symmetrical to the original wrt the 45 degree straight line.)
            let temp = this.x0;
            this.x0 = this.y0;
            this.y0 = temp;
            
            temp = this.x1;
            this.x1 = this.y1;
            this.y1 = temp;
            
            this._isSlopeNormalized = true;
        }
    }
    
    public get isSlopeNormalized(): boolean {
        return this._isSlopeNormalized;
    }
    
    public get dy(): number {
        return this._dy;
    }
    
    public get dx(): number {
        return this._dx;
    }
}

// TODO initially made for drawing white thin lines, can we adopt it for rectangular 'ribbons'?
export function rasterizeLine(image: Image, p1: [number, number], p2: [number, number]): Image {
        
    const line =  new Line(p1[0], p1[1], p2[0], p2[1]);
    let stepOfY: number;
    let stepOfEpsilon: number;
    if (line.dy > 0) {
        stepOfY = 1;
        stepOfEpsilon = line.dy;
    } else {
        stepOfY = -1;
        stepOfEpsilon = -line.dy;
    }
    
    let epsilon = 0;
    
    let x = line.x0;
    let y = line.y0;
    
    do {
        image = fillCell(x, y, image);
        
        x = x + 1;
        epsilon = epsilon + stepOfEpsilon;
        
        if ((epsilon << 1) > line.dx) {
            epsilon = epsilon - line.dx;
            y = y + stepOfY;
        }
    } while (x <= line.x1);
    return image;
}

function fillCell(x: number, y: number, image: Image): Image {
    image.rows[y].pixels[x] = {
        r: 255,
        b: 255,
        g: 255,
    }
    return image;
}



// Lots of duplication with `rasterizeLine`, consider deduplicating
export function setInitialPixelsForRibbon(image: Image, uninitializedRibbon: RibbonPosition, swathSize: number): RibbonPosition {
    // TODO this Line constructor can swap the p1 x and y, pushing p1 out of the legal bounds.
    //  We're currently handling it downstream, but it would be better to just not create invalid lines in the first place.
    const line =  new Line(uninitializedRibbon.p1[0], uninitializedRibbon.p1[1], uninitializedRibbon.p2[0], uninitializedRibbon.p2[1]);
    let stepOfY: number;
    let stepOfEpsilon: number;
    if (line.dy > 0) {
        stepOfY = 1;
        stepOfEpsilon = line.dy;
    } else {
        stepOfY = -1;
        stepOfEpsilon = -line.dy;
    }
    
    let epsilon = 0;
    
    let x = line.x0;
    let y = line.y0;
    
    do {
        addInitialPixels(x, y, image, uninitializedRibbon, swathSize);
        
        x = x + 1;
        epsilon = epsilon + stepOfEpsilon;
        
        // TODO wth, i don't think epsilon is even used. i don't remember how this chunk was meant to work. are we always
        //  generating 45 degree angles ??? oh no oh no oh no.
        if ((epsilon << 1) > line.dx) {
            epsilon = epsilon - line.dx;
            y = y + stepOfY;
        }
    } while (x <= line.x1);
    return uninitializedRibbon;
}

function addInitialPixels(x: number, y: number, image: Image, ribbon: RibbonPosition, swathSize: number) {
    // bandaid fix for the fact that we're sometimes invoking this out of bounds. should fix root cause instead
    if (x >= image.width || y >= image.height) {
        return;
    }

    for (let _x = x - swathSize; _x <= x + swathSize; _x++) {
        if (_x >=0 && _x < image.width) {
            ribbon.addUnsetPixels([[_x, y, image.rows[y].pixels[_x]]])
        }
    }
    for (let _y = y - swathSize; _y <= y + swathSize; _y++) {
        if (_y >= 0 && _y < image.height) {
            ribbon.addUnsetPixels([[x, _y, image.rows[_y].pixels[x]]])
        }
    }
}