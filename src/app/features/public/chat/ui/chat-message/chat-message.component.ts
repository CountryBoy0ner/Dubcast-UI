import { Component, Input, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'primeng/popover';
import { Subscription, timer } from 'rxjs';
import { ChatMessageDto } from '../../models/chat.model';
import { PublicProfileCacheService } from '../../../../../core/user/public-profile-cache.service';
import { PublicProfileResponse } from '../../../../../core/user/public-profile-api.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  standalone: true,
  imports: [CommonModule, PopoverModule],
})
export class ChatMessageComponent implements OnDestroy {
  private profiles = inject(PublicProfileCacheService);

  @Input() message!: ChatMessageDto;
  @ViewChild('pop') pop!: HTMLElement | null;

  profile: PublicProfileResponse | null = null;

  private hideSub?: Subscription;
  private loadSub?: Subscription;

  // No constructor needed — using `inject()` for DI

  ngOnDestroy(): void {
    this.hideSub?.unsubscribe();
    this.loadSub?.unsubscribe();
  }

  displayName(m: ChatMessageDto): string {
    const u = (m.username ?? '').trim();
    return u.length ? u : 'anonim';
  }

  onUserEnter(ev: MouseEvent): void {
    const username = (this.message.username ?? '').trim();
    if (!username) return;

    this.hideSub?.unsubscribe();
    this.loadSub?.unsubscribe();
    this.profile = null;

    this.loadSub = this.profiles.get(username).subscribe({
      next: (p) => {
        this.profile = p;
        type PopEl = HTMLElement & { show?: (ev?: MouseEvent) => void };
        const popEl = this.pop as PopEl | null;
        if (popEl && typeof popEl.show === 'function') popEl.show(ev);
      },
      error: () => {
        this.profile = null;
      },
    });
  }

  onUserLeave(): void {
    this.hideSub?.unsubscribe();
    this.hideSub = timer(150).subscribe(() => {
      type PopEl = HTMLElement & { hide?: () => void };
      const popEl = this.pop as PopEl | null;
      if (popEl && typeof popEl.hide === 'function') popEl.hide();
    });
  }

  stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 70%)`;
  }
}
