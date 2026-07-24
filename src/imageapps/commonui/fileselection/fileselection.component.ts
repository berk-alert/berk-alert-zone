import { Component, EventEmitter, Input, Output } from '@angular/core';
import { decodeImage } from '../../logic/getpixels';
import { Image } from '../../logic/image';

@Component({
  selector: 'bandrus-file-selection',
  templateUrl: './fileselection.component.html',
  styleUrls: ['./fileselection.component.css']
})
export class FileSelectionComponent {
    @Input() prompt: string = "";
    @Output() newImageEvent = new EventEmitter<Image>();
    

    public async uploadFile(event: Event) {
        const fileTarget = event.target as HTMLInputElement;
        if (fileTarget.files) {
            const fileReader = new FileReader();
            console.log('Reading file...');
            fileReader.readAsArrayBuffer(fileTarget.files[0])
            fileReader.addEventListener('load', (e) => {
                console.log('Done reading file!');
                if (e.target?.result) {
                    console.log('Decoding file...');
                    const decoded = decodeImage(e.target.result as ArrayBuffer);
                    console.log('Done decoding file!');

                    // Rotate before emitting
                    // const rotated = rotateClockwise(decoded);
                    const rotated = decoded;

                
                    this.newImageEvent.emit(rotated);
                }
            });
        }
    }
}
