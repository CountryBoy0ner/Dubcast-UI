import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { ScheduleApiService } from '../data-access/schedule-api.service';
import { ScheduleEntryDto } from '../models/schedule-entry.model';

export interface QueueVm {
  past: ScheduleEntryDto[];
  current: ScheduleEntryDto | null;
  next: ScheduleEntryDto[];
  fromIso: string;
  toIso: string;
}

@Injectable({ providedIn: 'root' })
export class QueueStoreService {
  private api = inject(ScheduleApiService);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private vmSubject = new BehaviorSubject<QueueVm | null>(null);

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  vm$ = this.vmSubject.asObservable();

  loadAroundNow(hours = 2): Observable<QueueVm | null> {
    const now = new Date();
    const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const to = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const fromIso = from.toISOString();
    const toIso = to.toISOString();

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.api.getRange(fromIso, toIso).pipe(
      map((entries) => this.buildVm(entries || [], fromIso, toIso)),
      tap((vm) => this.vmSubject.next(vm)),
      catchError((e) => {
        this.errorSubject.next(e?.error?.message || 'Failed to load queue');
        this.vmSubject.next(null);
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false)),
    );
  }

  private buildVm(entries: ScheduleEntryDto[], fromIso: string, toIso: string): QueueVm {
    const nowMs = Date.now();

    const sorted = [...entries].sort((a, b) => {
      const aa = Date.parse(a.startTime);
      const bb = Date.parse(b.startTime);
      return aa - bb;
    });

    const current =
      sorted.find((e) => {
        const s = Date.parse(e.startTime);
        const t = Date.parse(e.endTime);
        return s <= nowMs && nowMs < t;
      }) ?? null;

    const past = sorted
      .filter((e) => Date.parse(e.endTime) <= nowMs)
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)); // newest first

    const next = sorted.filter((e) => Date.parse(e.startTime) > nowMs); // upcoming

    return { past, current, next, fromIso, toIso };
  }
}
