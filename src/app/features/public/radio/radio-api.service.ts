import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NowPlayingResponse } from './now-playing.model';

@Injectable({ providedIn: 'root' })
export class RadioApiService {
  constructor(private http: HttpClient) {}

  getNowPlaying(): Observable<NowPlayingResponse | null> {
    return this.http
      .get<NowPlayingResponse>('/api/radio/now', { observe: 'response' })
      .pipe(
        map((resp: HttpResponse<NowPlayingResponse>) =>
          resp.status === 204 ? null : resp.body
        )
      );
  }
}
