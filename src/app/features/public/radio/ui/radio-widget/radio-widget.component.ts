import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { RadioStoreService } from '../../state/radio-store.service';
import { NowPlayingResponse } from '../../models/now-playing.model';

import { PlayerService } from '../../../../../core/audio/player.service';
import { BackgroundService } from '../../../../../core/background/background.service';

import { TrackLikesStoreService } from '../../../../../core/likes/state/track-likes-store.service';

import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

import { ChatComponent } from '../../../chat/ui/chat/chat.component';

@Component({
  selector: 'app-radio-widget',
  templateUrl: './radio-widget.component.html',
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, ButtonModule, ChatComponent],
  styleUrls: ['./radio-widget.component.scss'],
})
export class RadioWidgetComponent implements OnInit, OnDestroy {
  // state/services
  store = inject(RadioStoreService);
  private playerService = inject(PlayerService);
  private backgroundService = inject(BackgroundService);
  private likes = inject(TrackLikesStoreService);

  // likes ui streams
  likesCount$ = this.likes.likesCount$;
  liked$ = this.likes.liked$;
  canLike$ = this.likes.canLike$;
  likeLoading$ = this.likes.loading$;

  // now-playing data (local cache)
  private nowPlayingData = new BehaviorSubject<NowPlayingResponse | null>(null);
  now$ = this.nowPlayingData.asObservable();
  private nowSubscription?: Subscription;

  // radio ui streams
  loading$ = this.store.loading$;
  error$ = this.store.error$;
  volume$ = this.playerService.volume$;
  isPlaying$ = this.playerService.isPlaying$;

  ngOnInit(): void {
  this.nowSubscription = this.store.now$
    .pipe(
      filter((nowPlaying): nowPlaying is NowPlayingResponse => nowPlaying !== null),
      tap((nowPlaying) => {
        this.backgroundService.set(nowPlaying.artworkUrl ?? null);

        const trackId = nowPlaying.playing ? (nowPlaying.trackId ?? null) : null;
        const initialLikes = nowPlaying.likesCount ?? 0;

        this.likes.setCurrentTrack(trackId, initialLikes);
      }),
    )
    .subscribe((nowPlaying) => {
      this.nowPlayingData.next(nowPlaying);
    });
}


  ngOnDestroy(): void {
    this.nowSubscription?.unsubscribe();
  }

  toggleRadio(): void {
    this.playerService.toggle();
  }

  onVolumeChange(v: number): void {
    this.playerService.setVolume(v);
  }

  toggleLike(): void {
    this.likes.toggle();
  }
}
