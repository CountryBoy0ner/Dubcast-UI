import { Component, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  standalone: true,
  imports: [CommonModule, SoundcloudPlayerComponent],
})
/**
 * Global player sits in the app shell and coordinates playback for the whole app.
 * Business intent: Keep a single authoritative player instance that can sync
 * with server-reported now-playing state and control the embedded SoundCloud player.
 */
export class GlobalPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  private store = inject(RadioStoreService);
  private playerService = inject(PlayerService);
  private bg = inject(BackgroundService);

  @ViewChild('player') player?: SoundcloudPlayerComponent;

  volume = 70;
  isPlaying = false;
  private latestNow: NowPlayingResponse | null = null;

  private sub = new Subscription();
  private lastKey: string | null = null;
  private playLock = false;

  ngOnInit(): void {
    // Connect to live now-playing updates and fetch the initial state.
    this.store.connectLiveNowPlaying();
    this.store.loadNowPlaying();

    // Subscribe to player volume and playing state to reflect UI controls.
    this.sub.add(
      this.playerService.volume$.subscribe((v) => {
        this.volume = v;
      }),
    );

    this.sub.add(
      this.playerService.isPlaying$.subscribe((playing) => {
        this.isPlaying = playing;
        if (playing) {
          this.syncPlayerState();
        } else {
          if (this.player) this.player.pause();
        }
      }),
    );

    this.sub.add(
      this.store.now$.subscribe((now) => {
        this.latestNow = now;

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

    // If the track didn't change just ensure the embedded player is playing.
    if (this.lastKey === key) {
      if (this.player) this.player.play();
      return;
    }

    // Otherwise start playback from the reported position.
    this.lastKey = key;
    this.playFromNow(now);
  }

  private playFromNow(now: NowPlayingResponse): void {
    if (!this.player || this.playLock) return;

    this.playLock = true;
    setTimeout(() => (this.playLock = false), 1000);

    // Convert server's startedAt/duration to a millisecond offset and instruct
    // the embedded player to seek/play from that position.
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
