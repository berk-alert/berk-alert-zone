import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileSelectionComponent } from '../commonui/fileselection/fileselection.component';
import { getBlankImage, Image } from '../logic/image';
import { toBuffer } from '../logic/tobuffer';
import { getHighlightedBoundaryPoints, getHighlightedRibbonLines, getInitialRibbonPositions, pickAndApplyRibbon } from '../logic/ribbon/ribbonartoperations';
import { RibbonPosition } from '../logic/ribbon/ribbonposition';

@Component({
  selector: 'bandrus-ribbon-art',
  imports: [FileSelectionComponent],
  templateUrl: './ribbonart.component.html',
  styleUrl: './ribbonart.component.css'
})
export class RibbonArtComponent {

  @ViewChild('control')
  private controlCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

  @ViewChild('boundaryPoints')
  private boundaryPointsCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

  @ViewChild('ribbonPositions')
  private ribbonPositionsCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

  @ViewChild('ribbonImage')
  private ribbonImageCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;


  protected startImageProcessing(baseImage: Image): void {
    this.drawImage(this.controlCanvas, baseImage);

    const boundaryPointsImage = getHighlightedBoundaryPoints(baseImage);
    this.drawImage(this.boundaryPointsCanvas, boundaryPointsImage);

    const initialRibbonPositioningImage = getHighlightedRibbonLines(baseImage);
    this.drawImage(this.ribbonPositionsCanvas, initialRibbonPositioningImage);

    const initialRibbonImage = getBlankImage(baseImage.height, baseImage.width);
    this.drawImage(this.ribbonImageCanvas, initialRibbonImage);

    const initialRibbonPositions = getInitialRibbonPositions(baseImage);

    setTimeout(() => this.addRibbonLoop(initialRibbonImage, initialRibbonPositions), 0);
  }

  // TODO Duplicated with file selection? maybe move to helper
  private drawImage(element: ElementRef<HTMLCanvasElement>, image: Image) {
      const context = element.nativeElement.getContext('2d') as CanvasRenderingContext2D;
      element.nativeElement.height = image.height;
      element.nativeElement.width = image.width;
      var idata = context.createImageData(image.width, image.height);
      const dataBuffer = toBuffer(image);
      idata.data.set(dataBuffer);
      context.putImageData(idata, 0, 0);
  }

  private addRibbonLoop(imageSoFar: Image, ribbonPositions: RibbonPosition[]) {
    const [newImage, newRibbonPositions] = pickAndApplyRibbon(imageSoFar, ribbonPositions);
    this.drawImage(this.ribbonImageCanvas, newImage);

    if (newRibbonPositions.length == 0) {
        // You did it, congration
    } else {
        setTimeout(() => this.addRibbonLoop(newImage, newRibbonPositions));
    }
  }

}
