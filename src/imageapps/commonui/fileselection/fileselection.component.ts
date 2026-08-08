import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { decodeImage } from '../../logic/getpixels';
import { downsample, Image, rotateClockwise, rotateCounterClockwise } from '../../logic/image';
import { toBuffer } from '../../logic/tobuffer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bandrus-file-selection',
  imports: [CommonModule],
  templateUrl: './fileselection.component.html',
  styleUrls: ['./fileselection.component.css']
})
export class FileSelectionComponent {
    @Input() prompt: string = "";
    @Output() newImageEvent = new EventEmitter<Image>();

    // TODO I think if I make imageSoFar a signal I can skip the manual cdr calls.
    private cdr = inject(ChangeDetectorRef);

    protected imageSoFar: Image | undefined = undefined;

    protected shouldDisplay = false;

    @ViewChild('processedStartingPoint')
    private confirmationCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef<HTMLCanvasElement>;

    

    public async uploadFile(event: Event): Promise<void> {
        const fileTarget = event.target as HTMLInputElement;
        if (fileTarget.files) {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(fileTarget.files[0])
            fileReader.addEventListener('load', (e) => {
                if (e.target?.result) {
                    const decoded = decodeImage(e.target.result as ArrayBuffer);

                    this.imageSoFar = downsample(decoded);
                    this.drawImageSoFar();
                    this.shouldDisplay = true;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    private drawImageSoFar(): void {
        const context = this.confirmationCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const image = this.imageSoFar;
        if (!image) {
            return;
        }
        
        this.confirmationCanvas.nativeElement.height = image.height;
        this.confirmationCanvas.nativeElement.width = image.width;
        var idata = context.createImageData(image.width, image.height);
        const dataBuffer = toBuffer(image);
        idata.data.set(dataBuffer);
        context.putImageData(idata, 0, 0);
    }

    protected rotateClockwise(): void {
        if (!this.imageSoFar) {
            return;
        }
        this.imageSoFar = rotateClockwise(this.imageSoFar);
        this.drawImageSoFar();
        this.cdr.detectChanges();
    }

    protected rotateCounterClockwise(): void {
        if (!this.imageSoFar) {
            return;
        }
        this.imageSoFar = rotateCounterClockwise(this.imageSoFar);
        this.drawImageSoFar();
        this.cdr.detectChanges();
    }

    protected submit(): void {
        this.newImageEvent.emit(this.imageSoFar);
    }
}
