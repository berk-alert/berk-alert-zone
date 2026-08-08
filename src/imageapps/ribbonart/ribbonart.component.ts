import { Component } from '@angular/core';
import { FileSelectionComponent } from '../commonui/fileselection/fileselection.component';

@Component({
  selector: 'bandrus-ribbon-art',
  imports: [FileSelectionComponent],
  templateUrl: './ribbonart.component.html',
  styleUrl: './ribbonart.component.css'
})
export class RibbonArtComponent {
  public displayTextForTesting = "";

}
