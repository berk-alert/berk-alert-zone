import { Routes } from '@angular/router';
import { RibbonArtComponent } from '../imageapps/ribbonart/ribbonart.component';
import { TriangularizeComponent } from '../imageapps/triangularize/triangularize.component';

export const routes: Routes = [
    {
        path: 'imageapps/ribbonart',
        component: RibbonArtComponent,
        title: 'Ribbon Art',
    },
    {
        path: 'imageapps/triangularize',
        component: TriangularizeComponent,
        title: 'Traingularize',
    }
];
