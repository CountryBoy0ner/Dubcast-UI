import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { SliderModule } from 'primeng/slider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

//soumdcloud player component
import { SoundcloudPlayerComponent } from './components/soundcloud-player/soundcloud-player';

@NgModule({
  imports: [
    SoundcloudPlayerComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    MenubarModule,
    CardModule,
    SliderModule,
    SkeletonModule,
    ToastModule
  ],
  exports: [
    SoundcloudPlayerComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    MenubarModule,
    CardModule,
    SliderModule,
    SkeletonModule,
    ToastModule
  ]
})
export class SharedModule {}
