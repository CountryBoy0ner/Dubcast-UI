import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { UserApiService } from './user-api.service';

export interface IdentityState {
  username: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserIdentityService {
  private stateSubject = new BehaviorSubject<IdentityState>({
    username: null,
  });

  state$ = this.stateSubject.asObservable();

  username$ = this.state$.pipe(map((s) => (s.username ?? '').trim() || null));
  hasUsername$ = this.username$.pipe(map((u) => !!u));

  constructor(private api: UserApiService) {}

  /** дергаем после логина/при старте (если токен есть) */
  refresh(): Observable<string | null> {
    return this.api.me().pipe(
      map((p) => (p.username ?? '').trim() || null),
      tap((username) => this.stateSubject.next({ username })),
      catchError(() => {
        // если не залогинен или ошибка — сбрасываем username
        this.stateSubject.next({ username: null });
        return of(null);
      }),
    );
  }

  clear(): void {
    this.stateSubject.next({ username: null });
  }
}
