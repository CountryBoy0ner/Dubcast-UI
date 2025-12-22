import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { PublicProfileApiService, PublicProfileResponse } from './public-profile-api.service';

@Injectable({ providedIn: 'root' })
export class PublicProfileCacheService {
  private cache = new Map<string, Observable<PublicProfileResponse>>();

  constructor(private api: PublicProfileApiService) {}

  get(username: string): Observable<PublicProfileResponse> {
    const key = username.trim();
    if (!key) return throwError(() => new Error('Empty username'));

    const cached = this.cache.get(key);
    if (cached) return cached;

    const req$ = this.api.getByUsername(key).pipe(
      shareReplay(1),
      catchError((err) => {
        this.cache.delete(key);
        throw err;
      })
    );

    this.cache.set(key, req$);
    return req$;
  }
}
