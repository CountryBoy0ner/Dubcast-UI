import { Injectable, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlayerService } from '../audio/player.service';
import { RadioStoreService } from '../../features/public/radio/state/radio-store.service';

const DEFAULT_TITLE = 'Dubcast master thesis project';

@Injectable({ providedIn: 'root' })
/**
 * Updates the document title based on player and radio state.
 * Business intent: when the radio is playing show the current track title
 * in the browser tab to make it easy for users to identify what's playing.
 * If nothing is playing, fall back to the product default title.
 */
export class TitleService {
  private player = inject(PlayerService);
  private radio = inject(RadioStoreService);

  constructor() {
    // Combine the play state with the currently playing track and debounce
    // so rapid updates (e.g. websocket bursts) don't thrash the document title.
    combineLatest([this.player.isPlaying$, this.radio.now$])
      .pipe(debounceTime(50))
      .subscribe(([isPlaying, now]) => {
        try {
          // If playing and we have a valid track title — use it.
          if (isPlaying && now && typeof now.title === 'string' && now.title.trim().length) {
            document.title = now.title.trim();
          } else {
            // Otherwise show the product name/default title.
            document.title = DEFAULT_TITLE;
          }
        } catch {
          // Intentionally ignore errors updating document.title — not critical.
        }
      });
  }
}
