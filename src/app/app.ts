import { Component, OnInit, signal, HostBinding, OnDestroy, inject } from '@angular/core';
import { AnalyticsPresenceService } from './core/analytics/state/analytics-presence.service';
import { BackgroundService } from './core/background/background.service';
import { TitleService } from './core/title/title.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private presence = inject(AnalyticsPresenceService);
  private backgroundService = inject(BackgroundService);
  // ensure the title updater service is instantiated
  private titleService = inject(TitleService);
  private sanitizer = inject(DomSanitizer);

  protected readonly title = signal('dubcast-ui');

  @HostBinding('style.--background-image-url')
  protected bgImageUrl: SafeStyle | null = null;

  private bgSub: Subscription = new Subscription();

  ngOnInit(): void {
    this.presence.init();
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
