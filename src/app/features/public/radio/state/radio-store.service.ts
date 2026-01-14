import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { RadioApiService } from '../data-access/radio-api.service';
import { NowPlayingResponse } from '../models/now-playing.model';
import { RadioWsService } from '../data-access/radio-ws.service';

@Injectable({ providedIn: 'root' })
export class RadioStoreService {
  private api = inject(RadioApiService);
  private ws = inject(RadioWsService);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private nowSubject = new BehaviorSubject<NowPlayingResponse | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  now$ = this.nowSubject.asObservable();

  loadNowPlaying(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.api
      .getNowPlaying()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        // On successful fetch update the current now-playing subject.
        next: (data) => this.nowSubject.next(data),
        // On error set an error message that UI can display.
         error: (_e) => {
           this.errorSubject.next(_e?.message || 'Failed to load the current track');
        },
      });
  }

  connectLiveNowPlaying(): void {
    if (this._liveConnected) return;
    this._liveConnected = true;
    // Open websocket to receive live updates and push them into `now$`.
    this.ws.connect();
    this.ws.nowPlaying$.subscribe((p) => this.nowSubject.next(p));
  }

  private _liveConnected = false;
}
