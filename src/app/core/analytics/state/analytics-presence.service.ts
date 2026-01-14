import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { combineLatest, filter, map, startWith, distinctUntilChanged, Subscription } from 'rxjs';

import { PlayerService } from '../../audio/player.service';
import { RadioStoreService } from '../../../features/public/radio/state/radio-store.service';
import { AnalyticsWsService } from '../data-access/analytics-ws.service';
import { AnalyticsHeartbeatMessage } from '../models/analytics-heartbeat.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsPresenceService implements OnDestroy {
  private ws = inject(AnalyticsWsService);
  private player = inject(PlayerService);
  private radio = inject(RadioStoreService);
  private router = inject(Router);
  private zone = inject(NgZone);

  private started = false;

  private timerId: number | null = null;
  private subscription = new Subscription();
  private beforeUnloadHandler = () => {
    this.stopLoop();
    this.ws.sendHeartbeat({ ...this.lastMsg, listening: false });
  };

  private lastMsg: AnalyticsHeartbeatMessage = { page: '/', listening: false, trackId: null };

  private readonly HEARTBEAT_INTERVAL_MS = 5000;

  init(): void {
    if (this.started) return;
    this.started = true;

    this.ws.start();

    // page$ tracks the current visible route so presence messages include
    // the page path; this allows analytics to understand which pages users
    // view while listening.
    const page$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url || '/'),
      startWith(this.router.url || '/'),
      distinctUntilChanged(),
    );

    // listening$ resolves whether the user is actively listening to a
    // track (both UI indicates playing and the server reports a playing track).
    const listening$ = combineLatest([this.player.isPlaying$, this.radio.now$]).pipe(
      map(([uiPlaying, now]) => !!uiPlaying && !!now?.playing),
      distinctUntilChanged(),
    );

    const trackId$ = this.radio.now$.pipe(
      map((now) => (now?.playing ? (now.trackId ?? null) : null)),
      distinctUntilChanged(),
    );

    // Presence combines page, listening state and the current track id so
    // heartbeats include enough context for analytics ingestion.
    const presence$ = combineLatest([page$, listening$, trackId$]);

    this.subscription.add(
      presence$.subscribe(([page, listening, trackId]) => {
        const msg: AnalyticsHeartbeatMessage = { page, listening, trackId };

        if (!listening) {
          this.stopLoop();
          this.sendOnce(msg);
          this.lastMsg = msg;
          return;
        }

        const changed =
          this.lastMsg.page !== msg.page ||
          this.lastMsg.trackId !== msg.trackId ||
          this.lastMsg.listening !== msg.listening;

        this.lastMsg = msg;

        if (changed) this.sendOnce(msg);
        this.startLoop();
      }),
    );

    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private startLoop(): void {
    if (this.timerId) return;

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

  ngOnDestroy(): void {
    this.stopLoop();
    this.subscription.unsubscribe();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }
}
