import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private readonly backgroundUrl = new BehaviorSubject<string | null>(null);
  readonly backgroundUrl$ = this.backgroundUrl.asObservable();

  /**
   * Set the current background artwork URL.
   * Business intent: let other app parts (player/global shell) publish
   * artwork URLs and have the shell reactively apply them for theming.
   */
  set(url: string | null): void {
    this.backgroundUrl.next(url);
  }
}
