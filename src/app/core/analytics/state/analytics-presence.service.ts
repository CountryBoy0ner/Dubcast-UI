import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { combineLatest, filter, map, startWith, distinctUntilChanged, Subscription } from 'rxjs';

import { PlayerService } from '../../audio/player.service';
import { RadioStoreService } from '../../../features/public/radio/state/radio-store.service';
import { AnalyticsWsService } from '../data-access/analytics-ws.service';
import { AnalyticsHeartbeatMessage } from '../models/analytics-heartbeat.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsPresenceService implements OnDestroy {
  private started = false;

  private timerId: number | null = null;
  private subscription = new Subscription();
  private beforeUnloadHandler = () => {
    this.stopLoop();
    this.ws.sendHeartbeat({ ...this.lastMsg, listening: false });
  };

  private lastMsg: AnalyticsHeartbeatMessage = { page: '/', listening: false, trackId: null };

  // Backend TTL is 15s — send more often (5s)
  private readonly HEARTBEAT_INTERVAL_MS = 5000;

  constructor(
    private ws: AnalyticsWsService,
    private player: PlayerService,
    private radio: RadioStoreService,
    private router: Router,
    private zone: NgZone,
  ) {}

  init(): void {
    if (this.started) return;
    this.started = true;

    this.ws.start();

    const page$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url || '/'),
      startWith(this.router.url || '/'),
      distinctUntilChanged(),
    );

    // effective listening: кнопка play + реально playing от бэка
    const listening$ = combineLatest([this.player.isPlaying$, this.radio.now$]).pipe(
      map(([uiPlaying, now]) => !!uiPlaying && !!now?.playing),
      distinctUntilChanged(),
    );

    const trackId$ = this.radio.now$.pipe(
      map((now) => (now?.playing ? (now.trackId ?? null) : null)),
      distinctUntilChanged(),
    );

    const presence$ = combineLatest([page$, listening$, trackId$]);

    this.subscription.add(
      presence$.subscribe(([page, listening, trackId]) => {
        const msg: AnalyticsHeartbeatMessage = { page, listening, trackId };

        // if listening=false — stop loop and send OFF once
        if (!listening) {
          this.stopLoop();
          this.sendOnce(msg); // listening=false
          this.lastMsg = msg;
          return;
        }

        // listening=true
        // if page/trackId changed — send immediately and (re)start loop
        const changed =
          this.lastMsg.page !== msg.page ||
          this.lastMsg.trackId !== msg.trackId ||
          this.lastMsg.listening !== msg.listening;

        this.lastMsg = msg;

        if (changed) this.sendOnce(msg);
        this.startLoop(); // will send this.lastMsg at HEARTBEAT_INTERVAL_MS
      }),
    );

    // send OFF on tab/window close
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private startLoop(): void {
    if (this.timerId) return;

    // setInterval вне Angular зоны, чтобы не триггерить лишний change detection
    this.zone.runOutsideAngular(() => {
      this.timerId = window.setInterval(() => {
        this.ws.sendHeartbeat(this.lastMsg);
      }, this.HEARTBEAT_INTERVAL_MS);
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

  /** Clean up subscriptions and listeners */
  ngOnDestroy(): void {
    this.stopLoop();
    this.subscription.unsubscribe();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }
}
