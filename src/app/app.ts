import { Component, OnInit, signal, HostBinding, OnDestroy } from '@angular/core';
import { AnalyticsPresenceService } from './core/analytics/state/analytics-presence.service';
import { BackgroundService } from './core/background/background.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('dubcast-ui');

  @HostBinding('style.--background-image-url')
  protected bgImageUrl: SafeStyle | null = null;

  private bgSub: Subscription;

  constructor(
    private presence: AnalyticsPresenceService,
    private backgroundService: BackgroundService,
    private sanitizer: DomSanitizer,
  ) {
    this.bgSub = this.backgroundService.backgroundUrl$.subscribe((url) => {
      if (url) {
        this.bgImageUrl = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
      } else {
        this.bgImageUrl = null;
      }
    });
  }

  ngOnInit(): void {
    this.presence.init();
  }

  ngOnDestroy(): void {
    this.bgSub.unsubscribe();
  }
}
