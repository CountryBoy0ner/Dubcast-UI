import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { PublicLayout } from './public-layout';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserIdentityService } from '../../../../core/user/user-identity.service';

// ✅ Заглушка, чтобы шаблон <app-mini-player> не ломал тест
@Component({
  selector: 'app-mini-player',
  template: '',
  standalone: false,
})
class MiniPlayerStubComponent {}

describe('PublicLayout', () => {
  let component: PublicLayout;
  let fixture: ComponentFixture<PublicLayout>;

  // простые моки потоков
  const authState$ = new BehaviorSubject<Record<string, unknown>>({
    token: null,
    email: null,
    role: null,
    valid: false,
  });

  const authMock: Partial<AuthService> = {
    state$: authState$.asObservable(),
    isAuthenticated$: new BehaviorSubject(false).asObservable(),
    logout: () => {},
  };

  const identityMock: Partial<UserIdentityService> = {
    username$: new BehaviorSubject<string | null>(null).asObservable(),
    hasUsername$: new BehaviorSubject<boolean>(false).asObservable(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicLayout, MiniPlayerStubComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UserIdentityService, useValue: identityMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
