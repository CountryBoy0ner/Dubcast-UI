import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UpdateBioRequest,
  UpdateUsernameRequest,
  UserProfileResponse,
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private http = inject(HttpClient);

  // No constructor needed — using `inject()` for DI

  me(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>('/api/profile/me');
  }

  updateUsername(username: string): Observable<void> {
    const body: UpdateUsernameRequest = { username };
    return this.http.put<void>('/api/profile/username', body);
  }

  updateBio(bio: string): Observable<void> {
    const body: UpdateBioRequest = { bio };
    return this.http.put<void>('/api/profile/bio', body);
  }
}
