import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { NowPlayingResponse } from '../models/now-playing.model';

@Injectable({ providedIn: 'root' })
export class RadioWsService {
  private client?: Client;
  private nowPlayingSubject = new Subject<NowPlayingResponse>();

  nowPlaying$ = this.nowPlayingSubject.asObservable();

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/radio-ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe('/topic/now-playing', (m: IMessage) => {
          this.nowPlayingSubject.next(JSON.parse(m.body));
        });
      },
    });

    this.client.activate();
  }
}
