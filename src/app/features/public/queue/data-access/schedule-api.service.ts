import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScheduleEntryDto } from '../models/schedule-entry.model';

@Injectable({ providedIn: 'root' })
export class ScheduleApiService {
  private http = inject(HttpClient);

  /**
   * GET /api/programming/range?from=...&to=...
   * Backend: RadioProgrammingRestController.getRange()
   */
  getRange(fromIso: string, toIso: string): Observable<ScheduleEntryDto[]> {
    const params = new HttpParams().set('from', fromIso).set('to', toIso);
    return this.http.get<ScheduleEntryDto[]>('/api/programming/range', { params });
  }
}
