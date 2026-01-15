import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { QueuePage } from './queue-page';
import { QueueStoreService } from '../../queue/state/queue-store.service';

describe('QueuePage', () => {
  let component: QueuePage;
  let fixture: ComponentFixture<QueuePage>;
  let store: QueueStoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueuePage],
      providers: [
        {
          provide: QueueStoreService,
          useValue: {
            vm$: of({ past: [], current: null, next: [], fromIso: new Date().toISOString(), toIso: new Date().toISOString() }),
            loading$: of(false),
            error$: of(null),
            loadAroundNow: (_: number) => of(void 0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QueuePage);
    component = fixture.componentInstance;
    store = TestBed.inject(QueueStoreService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadAroundNow(2) on init', () => {
    const spy = vi.spyOn(store, 'loadAroundNow');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('trackByEntryId should return entry id', () => {
    expect(component.trackByEntryId(0, { id: 123 })).toBe(123);
  });
});
