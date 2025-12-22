import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerService } from '../../../core/audio/player.service';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniPlayerComponent {
  isPlaying$!: Observable<boolean>;
  volume$!: Observable<number>;

  constructor(private player: PlayerService) {
    this.isPlaying$ = this.player.isPlaying$;
    this.volume$ = this.player.volume$;
  }

  toggle(): void {
    this.player.toggle();
  }

  setVolume(v: number): void {
    this.player.setVolume(Number(v) || 0);
  }
}
