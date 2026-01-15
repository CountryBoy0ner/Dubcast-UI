import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { RadioWidgetComponent } from './radio-widget.component';
import { RadioStoreService } from '../../state/radio-store.service';
import { PlayerService } from '../../../../../core/audio/player.service';
import { BackgroundService } from '../../../../../core/background/background.service';
import { TrackLikesStoreService } from '../../../../../core/likes/state/track-likes-store.service';

describe('RadioWidgetComponent', () => {
  let component: RadioWidgetComponent;
  let fixture: ComponentFixture<RadioWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioWidgetComponent, HttpClientTestingModule],
      providers: [
        {
          provide: RadioStoreService,
          useValue: {
            now$: of(null),
            loading$: of(false),
            error$: of(null),
            loadNowPlaying: () => {},
          },
        },
        {
          provide: PlayerService,
          useValue: {
            volume$: of(50),
            isPlaying$: of(false),
            toggle: () => {},
            setVolume: () => {},
          },
        },
        {
          provide: BackgroundService,
          useValue: {
            set: () => {},
          },
        },
        {
          provide: TrackLikesStoreService,
          useValue: {
            likesCount$: of(0),
            liked$: of(false),
            canLike$: of(false),
            loading$: of(false),
            setCurrentTrack: () => {},
            toggle: () => {},
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
