import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { RadioStoreService } from '../../state/radio-store.service';
import { NowPlayingResponse } from '../../models/now-playing.model';
import { PlayerService } from '../../../../../core/audio/player.service';
import { BackgroundService } from '../../../../../core/background/background.service';

@Component({
  selector: 'app-radio-widget',
  templateUrl: './radio-widget.component.html',
  standalone: false,
  styleUrls: ['./radio-widget.component.scss'],
})
export class RadioWidgetComponent implements OnInit, OnDestroy {
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  private nowPlayingData = new BehaviorSubject<NowPlayingResponse | null>(null);
  now$ = this.nowPlayingData.asObservable();
  private nowSubscription?: Subscription;

  volume$!: Observable<number>;
  isPlaying$!: Observable<boolean>;

  constructor(
    public store: RadioStoreService,
    private playerService: PlayerService,
    private backgroundService: BackgroundService,
  ) {
    this.loading$ = this.store.loading$;
    this.error$ = this.store.error$;
    this.volume$ = this.playerService.volume$;
    this.isPlaying$ = this.playerService.isPlaying$;
  }

  ngOnInit(): void {
    this.nowSubscription = this.store.now$
      .pipe(
        tap((nowPlaying) => {
          this.backgroundService.set(nowPlaying?.artworkUrl ?? null);
        }),
        filter((nowPlaying) => nowPlaying !== null),
      )
      .subscribe((nowPlaying) => {
        this.nowPlayingData.next(nowPlaying);
      });
  }

  ngOnDestroy(): void {
    this.nowSubscription?.unsubscribe();
    // Clear background when component is destroyed
  }

  toggleRadio(): void {
    this.playerService.toggle();
  }

  onVolumeChange(v: number): void {
    this.playerService.setVolume(v);
  }
}
