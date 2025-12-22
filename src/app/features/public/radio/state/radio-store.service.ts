import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';
import { RadioApiService } from '../data-access/radio-api.service';
import { NowPlayingResponse } from '../models/now-playing.model';
import { RadioWsService } from '../data-access/radio-ws.service';

@Injectable({ providedIn: 'root' })
export class RadioStoreService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private nowSubject = new BehaviorSubject<NowPlayingResponse | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  now$ = this.nowSubject.asObservable();

  constructor(private api: RadioApiService, private ws: RadioWsService) { }

  loadNowPlaying(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.api
      .getNowPlaying()
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (data) => this.nowSubject.next(data),
        error: (e) => {
          console.error('[radio][now] error', e);
          this.errorSubject.next('Не удалось загрузить текущий трек');//todo 
        },
      });
  }

  connectLiveNowPlaying(): void {
    if (this._liveConnected) return;
    this._liveConnected = true;
    this.ws.connect();
    this.ws.nowPlaying$.subscribe((p) => this.nowSubject.next(p));
  }

  // prevent multiple subscriptions when connectLiveNowPlaying called repeatedly
  private _liveConnected = false;

}
