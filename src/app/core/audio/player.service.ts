import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private volumeSubject = new BehaviorSubject<number>(this.getSavedVolume());
  volume$ = this.volumeSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  isPlaying$ = this.isPlayingSubject.asObservable();

  constructor() {}

  setVolume(v: number): void {
    this.volumeSubject.next(v);
    localStorage.setItem('dubcast_volume', String(v));
  }

  toggle(): void {
    this.isPlayingSubject.next(!this.isPlayingSubject.value);
  }

  play(): void {
    this.isPlayingSubject.next(true);
  }

  pause(): void {
    this.isPlayingSubject.next(false);
  }

  private getSavedVolume(): number {
    const saved = localStorage.getItem('dubcast_volume');
    return saved ? Number(saved) : 70;
  }
}
