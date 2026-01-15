import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subscription, catchError, finalize, map, of, tap, combineLatest } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { TrackLikesApiService } from '../data-access/track-likes-api.service';
import { TrackLikesWsService } from '../data-access/track-likes-ws.service';

export interface TrackLikesUiState {
  trackId: number | null;
  likesCount: number;
  liked: boolean;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class TrackLikesStoreService {
  private api = inject(TrackLikesApiService);
  private ws = inject(TrackLikesWsService);
  private auth = inject(AuthService);

  private stateSubject = new BehaviorSubject<TrackLikesUiState>({
    trackId: null,
    likesCount: 0,
    liked: false,
    loading: false,
    error: null,
  });

  state$ = this.stateSubject.asObservable();
  trackId$ = this.state$.pipe(map((s) => s.trackId));
  likesCount$ = this.state$.pipe(map((s) => s.likesCount));
  liked$ = this.state$.pipe(map((s) => s.liked));
  loading$ = this.state$.pipe(map((s) => s.loading));

  canLike$ = combineLatest([this.auth.isAuthenticated$, this.trackId$]).pipe(
    map(([isAuth, trackId]) => isAuth && !!trackId),
  );

  private sub = new Subscription();

  constructor() {
    this.ws.connect();

    this.sub.add(
      this.ws.changed$.subscribe((ev) => {
        const cur = this.stateSubject.value;
        if (cur.trackId === ev.trackId) {
          this.patch({ likesCount: ev.likesCount });
        }
      }),
    );

    this.sub.add(
      this.auth.isAuthenticated$.subscribe((isAuth) => {
        const cur = this.stateSubject.value;
        if (!cur.trackId) return;

        if (!isAuth) {
          this.patch({ liked: false });
          return;
        }

        this.loadMe(cur.trackId);
      }),
    );
  }

  setCurrentTrack(trackId: number | null, initialLikesCount: number = 0): void {
    const cur = this.stateSubject.value;
    if (cur.trackId === trackId) {
      this.patch({ likesCount: initialLikesCount ?? 0 });
      return;
    }

    this.stateSubject.next({
      trackId,
      likesCount: initialLikesCount ?? 0,
      liked: false,
      loading: false,
      error: null,
    });

    if (!trackId) return;

    if (this.auth.isAuthenticatedNow()) {
      this.loadMe(trackId);
    }
  }

  toggle(): void {
    const cur = this.stateSubject.value;
    if (!cur.trackId) return;
    if (!this.auth.isAuthenticatedNow()) return;
    if (cur.loading) return;

    if (cur.liked) this.unlike(cur.trackId);
    else this.like(cur.trackId);
  }

  private loadMe(trackId: number): void {
    this.patch({ loading: true, error: null });

    this.api
      .me(trackId)
      .pipe(
        tap((r) => this.patch({ liked: !!r?.liked })),
        catchError(() => {
          this.patch({ liked: false });
          return of(null);
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  private like(trackId: number): void {
    this.patch({ loading: true, error: null });

    this.api
      .like(trackId)
      .pipe(
        tap((r) => this.patch({ liked: r.liked, likesCount: r.likesCount })),
        catchError((e) => {
          this.patch({ error: e?.error?.message || 'Failed to like track' });
          return of(null);
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  private unlike(trackId: number): void {
    this.patch({ loading: true, error: null });

    this.api
      .unlike(trackId)
      .pipe(
        tap((r) => this.patch({ liked: r.liked, likesCount: r.likesCount })),
        catchError((e) => {
          this.patch({ error: e?.error?.message || 'Failed to unlike track' });
          return of(null);
        }),
        finalize(() => this.patch({ loading: false })),
      )
      .subscribe();
  }

  private patch(p: Partial<TrackLikesUiState>): void {
    this.stateSubject.next({ ...this.stateSubject.value, ...p });
  }
}
