import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private readonly backgroundUrl = new BehaviorSubject<string | null>(null);
  readonly backgroundUrl$ = this.backgroundUrl.asObservable();

  set(url: string | null): void {
    this.backgroundUrl.next(url);
  }
}
