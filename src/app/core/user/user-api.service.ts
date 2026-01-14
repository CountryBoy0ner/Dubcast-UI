import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileMeResponse } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);

  me(): Observable<ProfileMeResponse> {
    return this.http.get<ProfileMeResponse>('/api/profile/me');
  }
}
