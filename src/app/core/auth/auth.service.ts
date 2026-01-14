import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap, catchError, map, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserIdentityService } from '../user/user-identity.service';

export interface AuthResponse {
  accessToken: string;
}
export interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  role?: string;
}
export interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  valid: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private identity = inject(UserIdentityService);

  private tokenKey = 'dubcast_token';

  private stateSubject = new BehaviorSubject<AuthState>({
    token: null,
    email: null,
    role: null,
    valid: false,
  });

  state$ = this.stateSubject.asObservable();
  isAuthenticated$ = this.state$.pipe(map((s) => s.valid));
  currentUser$ = this.state$.pipe(map((s) => s.email));

  // No constructor needed — using `inject()` for DI
  constructor() {
    const token = this.getToken();
    if (token) {
      this.setState({ token, email: null, role: null, valid: true });
      this.validateToken().subscribe();
    }
  }

  login(emailOrUsername: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>('/api/auth/login', {
        email: emailOrUsername,
        password,
      })
      .pipe(
        tap((res) => {
          if (!res?.accessToken) {
            throw new Error('Failed to get access token');
          }
          this.setToken(res.accessToken);
        }),
        switchMap(() => this.validateToken()),
        map((isValid) => {
          if (!isValid) {
            throw new Error('Failed to confirm session');
          }
        }),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  register(email: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>('/api/auth/register', {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          if (!res?.accessToken) {
            throw new Error('Failed to get access token');
          }
          this.setToken(res.accessToken);
        }),
        switchMap(() => this.validateToken()),
        map((isValid) => {
          if (!isValid) {
            throw new Error('Could not confirm session');
          }
        }),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);

    this.identity.clear();

    this.setState({ token: null, email: null, role: null, valid: false });
  }

  isAuthenticatedNow(): boolean {
    return this.stateSubject.value.valid;
  }

  getCurrentUser(): string | null {
    return this.stateSubject.value.email;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      this.identity.clear();
      this.setState({ token: null, email: null, role: null, valid: false });
      return of(false);
    }

    return this.http.post<ValidateTokenResponse>('/api/auth/validate', { token }).pipe(
      tap((r) => {
        if (r.valid) {
          this.setState({ token, email: r.email ?? null, role: r.role ?? null, valid: true });
          this.identity.refresh().subscribe();
        } else {
          this.logout();
        }
      }),

      map((r) => r.valid),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.setState({ token, email: null, role: null, valid: false });
  }

  private setState(s: AuthState) {
    this.stateSubject.next(s);
  }
}
