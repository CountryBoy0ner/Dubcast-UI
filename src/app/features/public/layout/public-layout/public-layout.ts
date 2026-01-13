import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserIdentityService } from '../../../../core/user/user-identity.service';
import { AnalyticsWsService } from '../../../../core/analytics/data-access/analytics-ws.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss'],
  standalone: false,
})
export class PublicLayout {
  isAuth$!: Observable<boolean>;
  displayName$!: Observable<string>;
  hasUsername$!: Observable<boolean>;

  onlineCount$!: Observable<number>;

  constructor(
    private auth: AuthService,
    private identity: UserIdentityService,
    private router: Router,
    private analyticsWs: AnalyticsWsService,
  ) {
    this.isAuth$ = this.auth.isAuthenticated$;

    const email$ = this.auth.state$.pipe(map((s) => (s.email ?? '').trim() || null));

    this.displayName$ = combineLatest([this.identity.username$, email$]).pipe(
      map(([u, e]) => u || e || 'anonim'),
    );

    this.hasUsername$ = this.identity.hasUsername$;

    this.onlineCount$ = this.analyticsWs.stats$.pipe(map((s) => s?.totalOnline ?? 0));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
