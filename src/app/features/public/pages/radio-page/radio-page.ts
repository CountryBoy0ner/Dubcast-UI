import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { RadioStoreService } from '../../radio/radio-store.service';
import { NowPlayingResponse } from '../../radio/now-playing.model';
import { SoundcloudPlayerComponent } from '../../../../shared/components/soundcloud-player/soundcloud-player';

@Component({
  selector: 'app-radio-page',
  standalone: false,
  templateUrl: './radio-page.html',
  styleUrls: ['./radio-page.scss'],
})
export class RadioPage implements OnInit, OnDestroy {
  @ViewChild('player') player?: SoundcloudPlayerComponent;

  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  now$!: Observable<NowPlayingResponse | null>;

  radioEnabled = false;
  showPlayer = false;
  volume = 25;
  playerReady = false;

  private sub = new Subscription();
  private lastKey: string | null = null;
  private latestNow: NowPlayingResponse | null = null;
  private playLock = false;

  constructor(public store: RadioStoreService) {
    this.now$ = this.store.now$;
    this.loading$ = this.store.loading$;
    this.error$ = this.store.error$;
    
    const saved = localStorage.getItem('dubcast_volume');
    if (saved) this.volume = Number(saved) || 70;
  }

  ngOnInit(): void {
    // 1) стартуем WS автообновление
    this.store.connectLiveNowPlaying();

    // 2) стартовая загрузка REST
    this.store.loadNowPlaying();

    // 3) когда now-playing меняется — если радио включено, грузим трек
    this.sub.add(
      this.now$.subscribe((now) => {
        this.latestNow = now;
        if (!this.radioEnabled) return;
        if (!now?.playing || !now.trackUrl) return;

        const key = `${now.trackUrl}|${now.startedAt ?? ''}`;
        if (this.lastKey === key) return;

        this.lastKey = key;
        this.playFromNow(now);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleRadio(): void {
    this.radioEnabled = !this.radioEnabled;

    if (!this.radioEnabled) {
      this.player?.pause();
      return;
    }

    if (this.latestNow?.playing && this.latestNow.trackUrl) {
      this.playFromNow(this.latestNow);
    } else {
      this.store.loadNowPlaying();
    }
  }

  onVolumeChange(v: number): void {
    this.volume = v;
    localStorage.setItem('dubcast_volume', String(v));
    // плеер сам применит через @Input volume (ngOnChanges)
  }

  onTrackFinish(): void {
    // на всякий случай: если закончился трек — спрашиваем “что сейчас”
    this.store.loadNowPlaying();
  }

  private playFromNow(now: NowPlayingResponse): void {
    if (this.playLock) return;
    this.playLock = true;
    setTimeout(() => (this.playLock = false), 1000);

    const posMs = this.computePositionMs(now);
    this.player?.load(now.trackUrl!, true, posMs);
  }

  private computePositionMs(now: NowPlayingResponse): number {
    if (!now.startedAt || !now.durationSeconds) return 0;
    const started = Date.parse(now.startedAt as any);
    if (Number.isNaN(started)) return 0;

    const elapsedSec = Math.max(0, (Date.now() - started) / 1000);
    const safeSec = Math.min(elapsedSec, Math.max(0, now.durationSeconds - 1));
    return Math.floor(safeSec * 1000);
  }
}
