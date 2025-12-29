import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { combineLatest, filter, map, startWith, distinctUntilChanged } from 'rxjs';

import { PlayerService } from '../../audio/player.service';
import { RadioStoreService } from '../../../features/public/radio/state/radio-store.service';
import { AnalyticsWsService } from '../data-access/analytics-ws.service';
import { AnalyticsHeartbeatMessage } from '../models/analytics-heartbeat.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsPresenceService {
  private started = false;

  private timerId: any = null;
  private lastMsg: AnalyticsHeartbeatMessage = { page: '/', listening: false, trackId: null };

  // TTL на бэке 15 сек -> шлём чаще (5 сек)
  private HEARTBEAT_MS = 5000;

  constructor(
    private ws: AnalyticsWsService,
    private player: PlayerService,
    private radio: RadioStoreService,
    private router: Router,
    private zone: NgZone
  ) {}

  init(): void {
    if (this.started) return;
    this.started = true;

    this.ws.start();

    const page$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url || '/'),
      startWith(this.router.url || '/'),
      distinctUntilChanged()
    );

    // effective listening: кнопка play + реально playing от бэка
    const listening$ = combineLatest([this.player.isPlaying$, this.radio.now$]).pipe(
      map(([uiPlaying, now]) => !!uiPlaying && !!now?.playing),
      distinctUntilChanged()
    );

    const trackId$ = this.radio.now$.pipe(
      map(now => (now?.playing ? (now.trackId ?? null) : null)),
      distinctUntilChanged()
    );

    combineLatest([page$, listening$, trackId$]).subscribe(([page, listening, trackId]) => {
      const msg: AnalyticsHeartbeatMessage = { page, listening, trackId };

      // если listening=false — остановить цикл и отправить OFF один раз
      if (!listening) {
        this.stopLoop();
        this.sendOnce(msg); // listening=false
        this.lastMsg = msg;
        return;
      }

      // listening=true
      // если поменялся page/trackId — отправим сразу + цикл
      const changed =
        this.lastMsg.page !== msg.page ||
        this.lastMsg.trackId !== msg.trackId ||
        this.lastMsg.listening !== msg.listening;

      this.lastMsg = msg;

      if (changed) this.sendOnce(msg);
      this.startLoop(); // будет слать раз в 5 сек последний this.lastMsg
    });

    // при закрытии вкладки отправим OFF
    window.addEventListener('beforeunload', () => {
      this.stopLoop();
      this.ws.sendHeartbeat({ ...this.lastMsg, listening: false });
    });
  }

  private startLoop(): void {
    if (this.timerId) return;

    // setInterval вне Angular зоны, чтобы не триггерить лишний change detection
    this.zone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        this.ws.sendHeartbeat(this.lastMsg);
      }, this.HEARTBEAT_MS);
    });
  }

  private stopLoop(): void {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  private sendOnce(msg: AnalyticsHeartbeatMessage): void {
    this.ws.sendHeartbeat(msg);
  }
}
