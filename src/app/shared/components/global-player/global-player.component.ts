// d:\Diplom\Dubcast\dubcast-ui\src\app\shared\components\global-player\global-player.component.ts

import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RadioStoreService } from '../../../features/public/radio/state/radio-store.service';
import { PlayerService } from '../../../core/audio/player.service';
import { SoundcloudPlayerComponent } from '../soundcloud-player/soundcloud-player';
import { NowPlayingResponse } from '../../../features/public/radio/models/now-playing.model';

import { AfterViewInit } from '@angular/core';
import { BackgroundService } from '../../../core/background/background.service';

@Component({
  selector: 'app-global-player',
  templateUrl: './global-player.component.html',
  styleUrls: ['./global-player.component.scss'],
  standalone: false,
})
export class GlobalPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('player') player?: SoundcloudPlayerComponent;

  volume = 70;
  isPlaying = false;
  private latestNow: NowPlayingResponse | null = null;

  private sub = new Subscription();
  private lastKey: string | null = null;
  private playLock = false;

  constructor(
    private store: RadioStoreService,
    private playerService: PlayerService,
    private bg: BackgroundService,
  ) {}

  ngOnInit(): void {
    // Подключаемся к сокетам и загружаем данные (теперь это делает глобальный плеер)
    this.store.connectLiveNowPlaying();
    this.store.loadNowPlaying();

    // Слушаем громкость
    this.sub.add(
      this.playerService.volume$.subscribe((v) => {
        this.volume = v;
      }),
    );

    // Слушаем команду Play/Pause
    this.sub.add(
      this.playerService.isPlaying$.subscribe((playing) => {
        this.isPlaying = playing;
        if (playing) {
          // При включении проверяем, нужно ли загрузить трек или просто продолжить
          this.syncPlayerState();
        } else {
          if (this.player) this.player.pause();
        }
      }),
    );

    // Слушаем треки
    this.sub.add(
      this.store.now$.subscribe((now) => {
        this.latestNow = now;

        // ✅ фон всегда обновляется независимо от страницы
        this.bg.set(now?.artworkUrl ?? null);

        if (this.isPlaying) {
          this.syncPlayerState();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onTrackFinish(): void {
    this.store.loadNowPlaying();
  }

  private syncPlayerState(): void {
    const now = this.latestNow;
    if (!now?.playing || !now.trackUrl) return;

    const key = `${now.trackUrl}|${now.startedAt ?? ''}`;

    // Если трек уже загружен (ключ совпадает), просто играем
    if (this.lastKey === key) {
      if (this.player) this.player.play();
      return;
    }

    // Если трек новый или еще не загружен
    this.lastKey = key;
    this.playFromNow(now);
  }

  private playFromNow(now: NowPlayingResponse): void {
    if (!this.player || this.playLock) return;

    this.playLock = true;
    setTimeout(() => (this.playLock = false), 1000);

    const posMs = this.computePositionMs(now);
    this.player.load(now.trackUrl!, true, posMs);
  }

  private computePositionMs(now: NowPlayingResponse): number {
    if (!now.startedAt || !now.durationSeconds) return 0;
    const started = Date.parse(String(now.startedAt));
    if (Number.isNaN(started)) return 0;

    const elapsedSec = Math.max(0, (Date.now() - started) / 1000);
    const safeSec = Math.min(elapsedSec, Math.max(0, now.durationSeconds - 1));
    return Math.floor(safeSec * 1000);
  }

  ngAfterViewInit(): void {
    if (this.isPlaying) {
      setTimeout(() => this.syncPlayerState(), 0);
    }
  }
}
