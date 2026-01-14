import { Component, OnInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatStoreService } from '../../state/chat-store.service';
import { Observable, Subscription } from 'rxjs';
import { ChatMessageDto } from '../../models/chat.model';
import { AuthService } from '../../../../../core/auth/auth.service';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
})
export class ChatComponent implements OnInit, OnDestroy {
  store = inject(ChatStoreService);
  private auth = inject(AuthService);

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

  ngOnInit(): void {
    this.isAuthenticated$ = this.auth.isAuthenticated$;

    this.messages$ = this.store.messages$;
    this.loading$ = this.store.loading$;

    this.subs.add(this.auth.isAuthenticated$.subscribe((val) => (this.isAuthenticated = val)));

    this.subs.add(
      this.store.messages$.subscribe(() => {
        setTimeout(() => this.handleMessagesUpdated(), 0);
      }),
    );

    this.store.loadPage(0).subscribe({
      next: () => {
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: () => {},
    });

    this.store.connectLive();
  }

  send(): void {
    const txt = this.input.trim();
    if (!txt) return;

    if (!this.auth.isAuthenticatedNow()) {
      this.hint = 'To write in the chat, please log in.';
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

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    this.userScrolledUp = !atBottom;

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
    } catch {
      // Ignore errors; considering reporting for monitoring
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
      next: (_list) => {
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight;

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
    return u.length ? u : 'Anonymous';
  }
}
