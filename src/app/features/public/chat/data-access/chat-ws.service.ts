import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { ChatMessageDto } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatWsService {
  private client?: Client;
  private incoming = new Subject<ChatMessageDto>();

  incoming$ = this.incoming.asObservable();

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('/radio-ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe('/topic/chat', (m: IMessage) => {
          try {
            const payload = JSON.parse(m.body) as ChatMessageDto;
            this.incoming.next(payload);
          } catch {
            // Ignore malformed payloads; consider reporting to monitoring.
          }
        });
      },
    });

    this.client.activate();
  }

  send(text: string): void {
    if (!this.client || !this.client.connected) {
      // Not connected — caller should handle retry/queueing.
      return;
    }
    const payload = { text };
    this.client.publish({ destination: '/app/chat.send', body: JSON.stringify(payload) });
  }
}
