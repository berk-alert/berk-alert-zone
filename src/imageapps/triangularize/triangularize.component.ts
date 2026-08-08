import { Component } from '@angular/core';
import { FileSelectionComponent } from '../commonui/fileselection/fileselection.component';

@Component({
  selector: 'bandrus-triangularize',
  imports: [FileSelectionComponent],
  templateUrl: './triangularize.component.html',
  styleUrl: './triangularize.component.css'
})
export class TriangularizeComponent {
  public displayTextForTesting = "";
}
