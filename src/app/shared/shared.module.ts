import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SliderModule } from 'primeng/slider';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { SoundcloudPlayerComponent } from './components/soundcloud-player/soundcloud-player';
import { MiniPlayerComponent } from './components/mini-player/mini-player.component';
import { PopoverModule } from 'primeng/popover';

import { OnlineListenersComponent } from './components/online-listeners/online-listeners.component';

@NgModule({
  declarations: [SoundcloudPlayerComponent, MiniPlayerComponent, OnlineListenersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    RippleModule,
    SliderModule,
    CardModule,
    SkeletonModule,
    TooltipModule,
    PopoverModule,
  ],
  exports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // PrimeNG
    ButtonModule,
    RippleModule,
    SliderModule,
    CardModule,
    SkeletonModule,
    TooltipModule,
    PopoverModule,

    // components
    SoundcloudPlayerComponent,
    MiniPlayerComponent,
    OnlineListenersComponent,
  ],
})
export class SharedModule { }
