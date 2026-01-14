import { Component, OnInit, signal, HostBinding, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalPlayerComponent } from './shared/components/global-player/global-player.component';
import { AnalyticsPresenceService } from './core/analytics/state/analytics-presence.service';
import { BackgroundService } from './core/background/background.service';
import { TitleService } from './core/title/title.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [RouterModule, GlobalPlayerComponent],
})
/**
 * Root application shell component.
 * Business concerns:
 * - Initializes presence/analytics tracking for the app lifecycle.
 * - Subscribes to background image service to set a CSS variable for theming.
 * This component intentionally avoids business logic beyond wiring cross-cutting services.
 */
export class App implements OnInit, OnDestroy {
  private presence = inject(AnalyticsPresenceService);
  private backgroundService = inject(BackgroundService);
  private titleService = inject(TitleService);
  private sanitizer = inject(DomSanitizer);

  protected readonly title = signal('dubcast-ui');

  @HostBinding('style.--background-image-url')
  protected bgImageUrl: SafeStyle | null = null;

  private bgSub: Subscription = new Subscription();

  ngOnInit(): void {
    // Start presence/analytics tracking for the user's session.
    this.presence.init();

    // Reactively apply background artwork URLs to the root CSS variable.
    // Business intent: central place for theming the app based on currently playing track.
    this.bgSub = this.backgroundService.backgroundUrl$.subscribe((url) => {
      if (url) {
        this.bgImageUrl = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
      } else {
        this.bgImageUrl = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.bgSub.unsubscribe();
  }
}
