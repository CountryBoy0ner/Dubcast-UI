import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ChatApiService } from '../data-access/chat-api.service';
import { ChatWsService } from '../data-access/chat-ws.service';
import { ChatMessageDto } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatStoreService {
  private api = inject(ChatApiService);
  private ws = inject(ChatWsService);

  private messagesSubject = new BehaviorSubject<ChatMessageDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messagesSub = new BehaviorSubject<ChatMessageDto[]>([]);

  messages$ = this.messagesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  private PAGE_SIZE = 20;
  private currentPage = 0; // 0 = latest page
  private noMore = false;

  private _liveConnected = false;

  // No constructor needed — using `inject()` for DI

  // Load a page from server. page=0 is the latest page.
  loadPage(page = 0): Observable<ChatMessageDto[]> {
    if (page !== 0 && this.noMore) {
      // return empty observable
      return new Observable<ChatMessageDto[]>((sub) => {
        sub.next([]);
        sub.complete();
      });
    }

    this.loadingSubject.next(true);
    return this.api.getPage(page, this.PAGE_SIZE).pipe(
      tap((list) => {
        const items = list || [];
        if (page === 0) {
          this.messagesSubject.next(items);
          this.currentPage = 0;
          this.noMore = items.length === 0;
        } else {
          if (items.length === 0) {
            this.noMore = true;
          } else {
            const cur = this.messagesSubject.value || [];
            this.messagesSubject.next([...items, ...cur]);
            this.currentPage = page;
          }
        }
        this.loadingSubject.next(false);
      }),
    );
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }

  public isNoMore(): boolean {
    return this.noMore;
  }

  connectLive(): void {
    if (this._liveConnected) return;
    this._liveConnected = true;
    this.ws.connect();
    this.ws.incoming$.subscribe((m) => {
      const cur = this.messagesSubject.value || [];

      this.messagesSubject.next([...cur, m]);
    });
  }

  send(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.api.send(trimmed).subscribe({
      next: (_saved) => {},
      error: (_e) => {
        // Log to monitoring system if available; keep UI error handling here instead.
        // console.error removed to avoid noisy logs in production.
      },
    });
  }
}
 