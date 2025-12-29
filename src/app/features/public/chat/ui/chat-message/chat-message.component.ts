import { Component, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ChatMessageDto } from '../../models/chat.model';
import { PublicProfileCacheService } from '../../../../../core/user/public-profile-cache.service';
import { PublicProfileResponse } from '../../../../../core/user/public-profile-api.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  standalone: false,
})
export class ChatMessageComponent implements OnDestroy {
  @Input() message!: ChatMessageDto;
  @ViewChild('pop') pop!: any;

  profile: PublicProfileResponse | null = null;

  private hideSub?: Subscription;
  private loadSub?: Subscription;

  constructor(private profiles: PublicProfileCacheService) {}

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
        // ✅ показываем ТОЛЬКО когда данные есть
        this.pop.show(ev);
      },
      error: () => {
        // ❗ если профиля нет — просто ничего не показываем (как ты просил)
        this.profile = null;
      },
    });
  }

  onUserLeave(): void {
    this.hideSub?.unsubscribe();
    this.hideSub = timer(150).subscribe(() => this.pop?.hide());
  }

  stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Пастельные/светлые цвета для темной темы (HSL)
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 70%)`;
  }
}
