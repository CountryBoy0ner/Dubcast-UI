import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatStoreService } from '../../state/chat-store.service';
import { Observable, Subscription } from 'rxjs';
import { ChatMessageDto } from '../../models/chat.model';
import { AuthService } from '../../../../../core/auth/auth.service';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: false,
})
export class ChatComponent implements OnInit {
  messages$!: Observable<ChatMessageDto[]>;
  loading$!: Observable<boolean>;
  input = '';
  isAuthenticated = false;
  hint = '';
  isAuthenticated$!: Observable<boolean>;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  private subs = new Subscription();
  private userScrolledUp = false;
  loadingPage = false;
  noMorePages = false;
  pageSize = 20;

  constructor(public store: ChatStoreService, private auth: AuthService) { }

  ngOnInit(): void {
    this.isAuthenticated$ = this.auth.isAuthenticated$;

    this.messages$ = this.store.messages$;
    this.loading$ = this.store.loading$;

    this.subs.add(
      this.auth.isAuthenticated$.subscribe(val => this.isAuthenticated = val)
    );

    // subscribe to messages to handle autoscroll
    this.subs.add(
      this.store.messages$.subscribe(() => {
        // wait a tick for DOM update
        setTimeout(() => this.handleMessagesUpdated(), 0);
      })
    );

    // initial load: page 0
    this.store.loadPage(0).subscribe({
      next: () => {
        // after initial page loaded, scroll to bottom
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: () => { },
    });

    this.store.connectLive();
  }

  send(): void {
    const txt = this.input.trim();
    if (!txt) return;

    if (!this.auth.isAuthenticatedNow()) {
      this.hint = 'Чтобы написать в чат, войдите в аккаунт.';
      setTimeout(() => (this.hint = ''), 3000);
      return;
    }

    this.store.send(txt);
    this.input = '';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onContainerScroll(): void {
    const el = this.messagesContainer.nativeElement;
    // if scrolled up more than 100px from bottom, consider user scrolled up
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    this.userScrolledUp = !atBottom;

    // if scrolled to very top — load older
    if (el.scrollTop <= 10 && !this.loadingPage && !this.store.isNoMore()) {
      this.loadOlder();
    }
  }

  private handleMessagesUpdated(): void {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;

    if (!this.userScrolledUp) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    try {
      el.scrollTop = el.scrollHeight;
    } catch (e) {
      // ignore
    }
  }

  loadOlder(): void {
    if (this.loadingPage || this.store.isNoMore()) return;
    const el = this.messagesContainer.nativeElement;
    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;
    this.loadingPage = true;
    const nextPage = this.store.getCurrentPage() + 1;
    this.store.loadPage(nextPage).subscribe({
      next: (list) => {
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;
          // keep viewport on same message
          el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
          this.loadingPage = false;
        }, 0);
      },
      error: () => {
        this.loadingPage = false;
      },
    });
  }

  displayName(m: ChatMessageDto): string {
    const u = (m.username || m.username || '').trim();
    return u.length ? u : 'Аноним';
  }
}
