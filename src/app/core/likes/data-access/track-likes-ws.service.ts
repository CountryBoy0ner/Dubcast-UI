import { Injectable, NgZone, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { TrackLikesChangedEvent } from '../models/track-likes.model';

@Injectable({ providedIn: 'root' })
export class TrackLikesWsService {
  private zone = inject(NgZone);

  private client?: Client;
  private changed = new Subject<TrackLikesChangedEvent>();
  changed$ = this.changed.asObservable();

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/radio-ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe('/topic/track-likes', (m: IMessage) => {
          try {
            const payload = JSON.parse(m.body) as TrackLikesChangedEvent;
            this.zone.run(() => this.changed.next(payload));
          } catch {
            // ignore
          }
        });
      },
    });

    this.client.activate();
  }
}
