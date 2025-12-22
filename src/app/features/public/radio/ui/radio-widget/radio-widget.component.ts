import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { RadioStoreService } from '../../state/radio-store.service';
import { NowPlayingResponse } from '../../models/now-playing.model';
import { PlayerService } from '../../../../../core/audio/player.service';

@Component({
    selector: 'app-radio-widget',
    templateUrl: './radio-widget.component.html',
    standalone: false,
    styleUrls: ['./radio-widget.component.scss'],
})
export class RadioWidgetComponent implements OnInit {
    loading$!: Observable<boolean>;
    error$!: Observable<string | null>;
    now$!: Observable<NowPlayingResponse | null>;
    
    // Состояние берем из сервиса плеера
    volume$!: Observable<number>;
    isPlaying$!: Observable<boolean>;


    constructor(
        public store: RadioStoreService,
        private playerService: PlayerService
    ) {
        this.now$ = this.store.now$;
        this.loading$ = this.store.loading$;
        this.error$ = this.store.error$;
        this.volume$ = this.playerService.volume$;
        this.isPlaying$ = this.playerService.isPlaying$;
    }

    ngOnInit(): void {
        // Инициализация данных теперь в GlobalPlayer, но можно оставить load для обновления UI
        // this.store.loadNowPlaying(); 
    }

    toggleRadio(): void {
        this.playerService.toggle();
    }

    onVolumeChange(v: number): void {
        this.playerService.setVolume(v);
    }
}
