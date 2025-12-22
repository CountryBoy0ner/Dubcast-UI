import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserIdentityService } from '../../../../core/user/user-identity.service';

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

  constructor(
    private auth: AuthService,
    private identity: UserIdentityService,
    private router: Router
  ) {
    this.isAuth$ = this.auth.isAuthenticated$;

    const email$ = this.auth.state$.pipe(
      map(s => (s.email ?? '').trim() || null)
    );

    this.displayName$ = combineLatest([this.identity.username$, email$]).pipe(
      map(([u, e]) => u || e || 'anonim')
    );

    this.hasUsername$ = this.identity.hasUsername$;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
