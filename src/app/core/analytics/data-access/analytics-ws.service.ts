import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { OnlineStatsDto } from '../models/online-stats.model';
import { AnalyticsHeartbeatMessage } from '../models/analytics-heartbeat.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsWsService {
  private client?: Client;
  private connected = false;

  private statsSubject = new BehaviorSubject<OnlineStatsDto | null>(null);
  stats$ = this.statsSubject.asObservable();

  private pendingHeartbeat: AnalyticsHeartbeatMessage | null = null;

  constructor(private zone: NgZone) {}

  start(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/radio-ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected = true;

        this.client!.subscribe('/topic/analytics/online', (m: IMessage) => {
          try {
            const payload = JSON.parse(m.body) as OnlineStatsDto;
            this.zone.run(() => this.statsSubject.next(payload));
          } catch (e) {
            console.error('[analytics-ws] parse error', e);
          }
        });

        // если пока не было соединения — дошлём последний heartbeat
        if (this.pendingHeartbeat) {
          const msg = this.pendingHeartbeat;
          this.pendingHeartbeat = null;
          this.sendHeartbeat(msg);
        }
      },
      onDisconnect: () => {
        this.connected = false;
      },
    });

    this.client.activate();
  }

  sendHeartbeat(msg: AnalyticsHeartbeatMessage): void {
    // если нет коннекта — запомним последний heartbeat
    if (!this.client || !this.client.connected) {
      this.pendingHeartbeat = msg;
      return;
    }

    this.client.publish({
      destination: '/app/analytics.heartbeat',
      body: JSON.stringify(msg),
    });
  }
}
