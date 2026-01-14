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

  setVolume(v: unknown): void {
    const n = Number(v as any) || 0;
    this.player.setVolume(n);
  }
}
