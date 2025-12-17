import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    CoreModule,
    SharedModule,

    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura} })
  ],
  bootstrap: [App]
})
export class AppModule {}
