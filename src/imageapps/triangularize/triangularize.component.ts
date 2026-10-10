import { Component, ElementRef, ViewChild } from '@angular/core';
import { getBlankImage, Image } from '../logic/image';
import { FileSelectionComponent } from '../commonui/fileselection/fileselection.component';
import { toBuffer } from '../logic/tobuffer';
import { applyRandomTriangle, isBetter } from '../logic/triangle/triangulizer';

@Component({
  selector: 'bandrus-triangularize',
  imports: [FileSelectionComponent],
  templateUrl: './triangularize.component.html',
  styleUrl: './triangularize.component.css'
})
export class TriangularizeComponent {
  @ViewChild('control')
  private controlCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

  @ViewChild('trianagleImage')
  private triangleImage: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

  public iterations: number = 0;
  public appliedIterations: number = 0;

  protected startImageProcessing(controlImage: Image): void {
    this.drawImage(this.controlCanvas, controlImage);

    const blankImage = getBlankImage(controlImage.height, controlImage.width);

    setTimeout(() => this.triangularizeLoop(blankImage, controlImage), 0);
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

     private triangularizeLoop(bssf: Image, control: Image, iterations: number = 0): void {
        this.iterations = iterations;
        const [newImage, affectedArea] = applyRandomTriangle(bssf, control);
        if (isBetter(control, bssf, newImage, affectedArea)) {
            bssf = newImage;
            this.appliedIterations += 1;
            this.drawImage(this.triangleImage, bssf);
        }
        if (iterations >= 500000) {
            return;
        }
        setTimeout(() => this.triangularizeLoop(bssf, control, iterations + 1), 0);
    }
}
