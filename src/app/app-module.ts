import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { GlobalPlayerComponent } from './shared/components/global-player/global-player.component';
@NgModule({
  imports: [
    BrowserModule,

    CoreModule,
    SharedModule,

    AppRoutingModule,
    GlobalPlayerComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
})
export class AppModule {}
