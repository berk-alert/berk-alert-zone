import { Routes } from '@angular/router';
import { RibbonArtComponent } from '../imageapps/ribbonart/ribbonart.component';
import { TriangularizeComponent } from '../imageapps/triangularize/triangularize.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home',
    },
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
