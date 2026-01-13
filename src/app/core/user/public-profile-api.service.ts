import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicProfileResponse {
  username: string;
  bio?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicProfileApiService {
  constructor(private http: HttpClient) {}

  getByUsername(username: string): Observable<PublicProfileResponse> {
    return this.http.get<PublicProfileResponse>(
      `/api/profile/public/${encodeURIComponent(username)}`,
    );
  }
}
