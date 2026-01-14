import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LikeResponse {
  trackId: number;
  likesCount: number;
  liked: boolean;
}

export interface MyLikeResponse {
  liked: boolean;
}

@Injectable({ providedIn: 'root' })
export class LikeApiService {
  private http = inject(HttpClient);

  like(trackId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`/api/likes/${trackId}`, {});
  }

  unlike(trackId: number): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`/api/likes/${trackId}`);
  }

  getMyLike(trackId: number): Observable<MyLikeResponse> {
    return this.http.get<MyLikeResponse>(`/api/likes/${trackId}/me`);
  }
}
