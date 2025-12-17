import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsPage } from './playlists-page';

describe('PlaylistsPage', () => {
  let component: PlaylistsPage;
  let fixture: ComponentFixture<PlaylistsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
