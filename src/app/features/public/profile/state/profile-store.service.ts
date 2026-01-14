import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, switchMap, tap, catchError, of, map } from 'rxjs';
import { ProfileApiService } from '../data-access/profile-api.service';
import { UserProfileResponse } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileStoreService {
  private api = inject(ProfileApiService);

  private profileSubject = new BehaviorSubject<UserProfileResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private savingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  profile$ = this.profileSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  saving$ = this.savingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // No constructor needed — using `inject()` for DI

  load(): Observable<UserProfileResponse | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.me().pipe(
      tap((p) => this.profileSubject.next(p)),
      catchError((_e) => {
        this.errorSubject.next(_e?.error?.message || 'Failed to load profile');
        this.profileSubject.next(null);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false)),
    );
  }

  saveUsername(username: string): Observable<void> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.updateUsername(username).pipe(
      switchMap(() => this.api.me()),
      tap((p) => this.profileSubject.next(p)),
      map(() => void 0),
      catchError((_e) => {
        this.errorSubject.next(_e?.error?.message || 'Failed to update username');
        return of(void 0);
      }),
      finalize(() => this.savingSubject.next(false)),
    );
  }

  saveBio(bio: string): Observable<void> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.updateBio(bio).pipe(
      switchMap(() => this.api.me()),
      tap((p) => this.profileSubject.next(p)),
      map(() => void 0),
      catchError((_e) => {
        this.errorSubject.next(_e?.error?.message || 'Failed to update bio');
        return of(void 0);
      }),
      finalize(() => this.savingSubject.next(false)),
    );
  }
}
