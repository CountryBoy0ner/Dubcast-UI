import { Component, Input, ViewChild, OnDestroy, HostBinding } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ChatMessageDto } from '../../models/chat.model';
import { PublicProfileCacheService } from '../../../../../core/user/public-profile-cache.service';
import { PublicProfileResponse } from '../../../../../core/user/public-profile-api.service';
import { UserIdentityService } from 'src/app/core/user/user-identity.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  standalone: false,
})
export class ChatMessageComponent implements OnDestroy {
  @Input() message!: ChatMessageDto;
  @ViewChild('pop') pop!: any;

  @HostBinding('class.own')
  get isOwnMessage(): boolean {
    return this.userIdentity.username() === this.message.username;
  }

  profile: PublicProfileResponse | null = null;

  private hideSub?: Subscription;
  private loadSub?: Subscription;

  constructor(
    private profiles: PublicProfileCacheService,
    private userIdentity: UserIdentityService
  ) {}

  ngOnDestroy(): void {
    this.hideSub?.unsubscribe();
    this.loadSub?.unsubscribe();
  }

  displayName(m: ChatMessageDto): string {
    const u = (m.username ?? '').trim();
    return u.length ? u : 'Anonymous';
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
        // ✅ show ONLY when data is available
        this.pop.show(ev);
      },
      error: () => {
        // ❗ if there is no profile — just don't show anything (as you asked)
        this.profile = null;
      },
    });
  }

  onUserLeave(): void {
    this.hideSub?.unsubscribe();
    this.hideSub = timer(150).subscribe(() => this.pop?.hide());
  }
}
