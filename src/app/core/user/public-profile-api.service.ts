import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicProfileResponse {
  username: string;
  bio?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicProfileApiService {
  private http = inject(HttpClient);

  // No constructor needed — using `inject()` for DI

  getByUsername(username: string): Observable<PublicProfileResponse> {
    return this.http.get<PublicProfileResponse>(
      `/api/profile/public/${encodeURIComponent(username)}`,
    );
  }
}
