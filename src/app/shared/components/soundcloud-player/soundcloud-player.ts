import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare const SC: any;

@Component({
  selector: 'app-soundcloud-player',
  templateUrl: './soundcloud-player.html',
  styleUrls: ['./soundcloud-player.scss'],
})
export class SoundcloudPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('iframe', { static: true }) iframeRef!: ElementRef<HTMLIFrameElement>;

  @Input() visible = true;
  @Input() volume = 70;

  @Output() ready = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();

  safeSrc: SafeResourceUrl;

  private widget: any | null = null;
  private widgetReady = false;

  // держим pending, если load вызвали раньше READY
  private pendingLoad: { url: string; autoPlay: boolean; positionMs: number } | null = null;

  constructor(private sanitizer: DomSanitizer) {
    // start with a blank iframe to avoid SoundCloud widget errors on init
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }

  ngAfterViewInit(): void {
    // widget will be created lazily when a real track is loaded or when
    // component becomes visible with a pending load
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['volume']) {
      this.applyVolume();
    }
    // if component becomes visible and there is a pending load, init widget
    if (changes['visible'] && changes['visible'].currentValue && this.pendingLoad && !this.widget) {
      const p = this.pendingLoad;
      const playerUrl = 'https://w.soundcloud.com/player/?visual=true&url=' + encodeURIComponent(p.url) + '&auto_play=' + (p.autoPlay ? 'true' : 'false');
      this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(playerUrl);
      // let the iframe update then create widget
      setTimeout(() => this.createWidget(), 0);
    }
  }

  ngOnDestroy(): void {
    // у SC.Widget нет нормального destroy, просто отпускаем ссылку
    this.widget = null;
  }

  load(url: string, autoPlay = true, positionMs = 0): void {
    // build player iframe URL
    const playerUrl = 'https://w.soundcloud.com/player/?visual=true&url=' + encodeURIComponent(url) + '&auto_play=' + (autoPlay ? 'true' : 'false');

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
    try { this.widget.pause?.(); } catch (e) { /* ignore */ }

    this.widget.load(url, {
      auto_play: autoPlay,
      visual: true,
      callback: () => {
        this.applyVolume();
        if (positionMs > 0) this.widget.seekTo(positionMs);
      },
    });
  }

  pause(): void {
    this.widget?.pause?.();
  }

  private createWidget(): void {
    const iframe = this.iframeRef.nativeElement;
    this.widget = SC.Widget(iframe);

    this.widget.bind(SC.Widget.Events.READY, () => {
      this.widgetReady = true;
      this.applyVolume();
      this.ready.emit();

      if (this.pendingLoad) {
        const p = this.pendingLoad;
        this.pendingLoad = null;
        this.load(p.url, p.autoPlay, p.positionMs);
      }
    });

    this.widget.bind(SC.Widget.Events.FINISH, () => {
      this.finish.emit();
    });
  }

  private applyVolume(): void {
    if (!this.widget || !this.widgetReady) return;
    const v = Math.max(0, Math.min(100, Number(this.volume) || 0));
    this.widget.setVolume(v);
  }
}
