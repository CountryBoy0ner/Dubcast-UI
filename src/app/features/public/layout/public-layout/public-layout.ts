import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-public-layout',
  standalone: false,
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
})
export class PublicLayout {
  items: MenuItem[] = [
    { label: 'Radio', icon: 'pi pi-play', routerLink: '/radio' },
  ];
}
