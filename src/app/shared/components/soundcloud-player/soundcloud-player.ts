import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

type SCWidgetInstance = {
  pause?: () => void;
  load: (url: string, opts: { auto_play?: boolean; visual?: boolean; callback?: () => void }) => void;
  bind: (event: string, cb: () => void) => void;
  setVolume?: (v: number) => void;
  play?: () => void;
  seekTo?: (ms: number) => void;
};

declare const SC: {
  Widget: {
    (iframe: HTMLIFrameElement): SCWidgetInstance;
    Events: { READY: string; FINISH: string };
  };
};

@Component({
  selector: 'app-soundcloud-player',
  templateUrl: './soundcloud-player.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./soundcloud-player.scss'],
})
export class SoundcloudPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  private sanitizer = inject(DomSanitizer);

  @ViewChild('iframe', { static: true }) iframeRef!: ElementRef<HTMLIFrameElement>;

  @Input() visible = true;
  @Input() volume = 70;

  @Output() scReady = new EventEmitter<void>();
  @Output() scFinish = new EventEmitter<void>();

  safeSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

  private widget: SCWidgetInstance | null = null;
  private widgetReady = false;

  private pendingLoad: { url: string; autoPlay: boolean; positionMs: number } | null = null;

  // No constructor needed — using `inject()` for DI

  ngAfterViewInit(): void {
    // widget will be created lazily when a real track is loaded or when
    // component becomes visible with a pending load
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['volume']) this.applyVolume();
  }

  ngOnDestroy(): void {
    this.widget = null;
  }

  load(url: string, autoPlay = true, positionMs = 0): void {
    // build player iframe URL
    const playerUrl =
      'https://w.soundcloud.com/player/?visual=true&url=' +
      encodeURIComponent(url) +
      '&auto_play=' +
      (autoPlay ? 'true' : 'false');

    // if widget not yet created, set iframe src and create widget lazily
    if (!this.widget) {
      this.pendingLoad = { url, autoPlay, positionMs };
      this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(playerUrl);
      // let Angular update iframe src, then create widget
      setTimeout(() => {
        if (!this.widget) this.createWidget();
      }, 0);
      return;
    }

    if (!this.widgetReady) {
      this.pendingLoad = { url, autoPlay, positionMs };
      return;
    }

    // ensure any previous playback is stopped before loading new track
    const w = this.widget;
    if (!w) return;

    try {
      w.pause?.();
    } catch {
      /* ignore parse errors from third-party widget */
    }

    w.load(url, {
      auto_play: autoPlay,
      visual: true,
      callback: () => {
        this.applyVolume();
        if (positionMs > 0) w.seekTo?.(positionMs);
      },
    });
  }

  private createWidget(): void {
    const iframe = this.iframeRef.nativeElement;
    this.widget = SC.Widget(iframe);

    this.widget.bind(SC.Widget.Events.READY, () => {
      this.widgetReady = true;
      this.applyVolume();
      this.scReady.emit();

      if (this.pendingLoad) {
        const p = this.pendingLoad;
        this.pendingLoad = null;
        this.load(p.url, p.autoPlay, p.positionMs);
      }
    });

    this.widget.bind(SC.Widget.Events.FINISH, () => {
      this.scFinish.emit();
    });
  }

  private applyVolume(): void {
    const w = this.widget;
    if (!w || !this.widgetReady) return;
    const v = Math.max(0, Math.min(100, Number(this.volume) || 0));
    w.setVolume?.(v);
  }
  public play(): void {
    const w = this.widget;
    if (!w) return;
    w.play?.();
  }

  public pause(): void {
    const w = this.widget;
    if (!w) return;
    w.pause?.();
  }
}
