import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ProfilePage } from './profile-page';
import { ProfileStoreService } from '../../profile/state/profile-store.service';
import { UserProfileResponse } from '../../profile/models/profile.model';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let store: ProfileStoreService;

  const mockProfile: UserProfileResponse = {
    username: 'testuser',
    bio: 'test bio',
    id: '',
    slug: '',
    micSource: false,
    pseudoSource: false,
    isOnline: false,
    lastSeen: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage, CommonModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: ProfileStoreService,
          useValue: {
            profile$: of(mockProfile),
            loading$: of(false),
            saving$: of(false),
            error$: of(null),
            load: () => of(mockProfile),
            saveUsername: (username: string) => of({ ...mockProfile, username }),
            saveBio: (bio: string) => of({ ...mockProfile, bio }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    store = TestBed.inject(ProfileStoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', fakeAsync(() => {
    spyOn(store, 'load').and.callThrough();
    component.ngOnInit();
    tick();
    expect(store.load).toHaveBeenCalled();
    expect(component.form.get('username')?.value).toBe('testuser');
    expect(component.form.get('bio')?.value).toBe('test bio');
  }));

  it('should have an invalid username if it is too short', () => {
    component.form.get('username')?.setValue('a');
    expect(component.form.get('username')?.invalid).toBeTruthy();
  });

  it('should have an invalid username if it is too long', () => {
    component.form.get('username')?.setValue('a'.repeat(51));
    expect(component.form.get('username')?.invalid).toBeTruthy();
  });

  it('should have an invalid username if it contains invalid characters', () => {
    component.form.get('username')?.setValue('a-b');
    expect(component.form.get('username')?.invalid).toBeTruthy();
  });

  it('should not save username if it is invalid', () => {
    spyOn(store, 'saveUsername').and.callThrough();
    component.form.get('username')?.setValue('a');
    component.saveUsername();
    expect(store.saveUsername).not.toHaveBeenCalled();
  });
  
  it('should save username if it is valid and changed', () => {
    spyOn(store, 'saveUsername').and.callThrough();
    component.form.get('username')?.setValue('newuser');
    component.saveUsername();
    expect(store.saveUsername).toHaveBeenCalledWith('newuser');
  });

  it('should not save username if it is not changed', () => {
    spyOn(store, 'saveUsername').and.callThrough();
    component.form.get('username')?.setValue('testuser');
    component.saveUsername();
    expect(store.saveUsername).not.toHaveBeenCalled();
  });

  it('should save bio if it is valid', () => {
    spyOn(store, 'saveBio').and.callThrough();
    component.form.get('bio')?.setValue('new bio');
    component.saveBio();
    expect(store.saveBio).toHaveBeenCalledWith('new bio');
  });
});
