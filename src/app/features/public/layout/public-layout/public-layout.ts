import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CommonModule } from '@angular/common';

import { MiniPlayerComponent } from '../../../../shared/components/mini-player/mini-player.component';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserIdentityService } from '../../../../core/user/user-identity.service';
import { AnalyticsWsService } from '../../../../core/analytics/data-access/analytics-ws.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MiniPlayerComponent],
})
export class PublicLayout {
  private auth = inject(AuthService);
  private identity = inject(UserIdentityService);
  private router = inject(Router);
  private analyticsWs = inject(AnalyticsWsService);

  isAuth$ = this.auth.isAuthenticated$;
  private email$ = this.auth.state$.pipe(map((s) => (s.email ?? '').trim() || null));

  displayName$ = combineLatest([this.identity.username$, this.email$]).pipe(
    map(([u, e]) => u || e || 'anonim'),
  );

  hasUsername$ = this.identity.hasUsername$;

  onlineCount$ = this.analyticsWs.stats$.pipe(map((s) => s?.totalOnline ?? 0));

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
