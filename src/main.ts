import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { App } from './app/app';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing-module';
import { CoreModule } from './app/core/core.module';
import { SharedModule } from './app/shared/shared.module';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { AuthInterceptor } from './app/core/auth/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      CoreModule,
      SharedModule,
    ),
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ theme: { preset: Aura } }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));
