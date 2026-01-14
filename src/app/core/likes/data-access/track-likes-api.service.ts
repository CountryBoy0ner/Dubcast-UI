import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrackLikeMeResponse, TrackLikeStateResponse } from '../models/track-likes.model';

@Injectable({ providedIn: 'root' })
export class TrackLikesApiService {
  private http = inject(HttpClient);

  like(trackId: number): Observable<TrackLikeStateResponse> {
    return this.http.post<TrackLikeStateResponse>(`/api/likes/${trackId}`, {});
  }

  unlike(trackId: number): Observable<TrackLikeStateResponse> {
    return this.http.delete<TrackLikeStateResponse>(`/api/likes/${trackId}`);
  }

  me(trackId: number): Observable<TrackLikeMeResponse> {
    return this.http.get<TrackLikeMeResponse>(`/api/likes/${trackId}/me`);
  }
}
