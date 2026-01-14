import { Injectable, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlayerService } from '../audio/player.service';
import { RadioStoreService } from '../../features/public/radio/state/radio-store.service';

const DEFAULT_TITLE = 'Dubcast master thesis project';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private player = inject(PlayerService);
  private radio = inject(RadioStoreService);

  constructor() {
    // Update title when play state or now-playing changes.
    combineLatest([this.player.isPlaying$, this.radio.now$])
      .pipe(debounceTime(50))
      .subscribe(([isPlaying, now]) => {
        try {
          if (isPlaying && now && typeof now.title === 'string' && now.title.trim().length) {
            document.title = now.title.trim();
          } else {
            document.title = DEFAULT_TITLE;
          }
        } catch {
          // ignore in non-browser environments
        }
      });
  }
}
