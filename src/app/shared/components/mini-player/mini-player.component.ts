import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { RippleModule } from 'primeng/ripple';
import { PlayerService } from '../../../core/audio/player.service';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SliderModule, RippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniPlayerComponent {
  private player = inject(PlayerService);

  isPlaying$ = this.player.isPlaying$;
  volume$ = this.player.volume$;

  toggle(): void {
    this.player.toggle();
  }

  /**
   * UI bridge for the slider control. Accepts number|string because the
   * slider/ngModel may provide either; convert to Number and forward to
   * the PlayerService. Business intent: keep the UI control thin and
   * delegate persistence and reactive distribution to `PlayerService`.
   */
  setVolume(v: number | string): void {
    const n = Number(v) || 0;
    this.player.setVolume(n);
  }
}
