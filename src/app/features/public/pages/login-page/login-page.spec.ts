import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { LoginPage } from './login-page';
import { AuthService } from '../../../../core/auth/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage, ReactiveFormsModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should be invalid if emailOrUsername is not provided', () => {
    const email = component.form.get('emailOrUsername');
    email?.setValue('');
    expect(email?.valid).toBeFalsy();
  });

  it('should be invalid if password is not provided', () => {
    const password = component.form.get('password');
    password?.setValue('');
    expect(password?.valid).toBeFalsy();
  });

  it('should be invalid if password is less than 3 characters', () => {
    const password = component.form.get('password');
    password?.setValue('12');
    expect(password?.valid).toBeFalsy();
  });

  it('should have a valid form when all fields are filled correctly', () => {
    component.form.get('emailOrUsername')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');
    expect(component.form.valid).toBeTruthy();
  });

  it('should call auth.login on submit with valid form', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({} as any));

    component.form.get('emailOrUsername')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');

    component.submit();

    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password');
  });

  it('should navigate to /radio on successful login', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({} as any));
    vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.form.get('emailOrUsername')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/radio']);
  });

  it('should set error message on failed login', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } })),
    );

    component.form.get('emailOrUsername')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');

    component.submit();

    expect(component.error).toBe('Invalid credentials');
  });

  it('should not call auth.login on submit with invalid form', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({} as any));

    component.submit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
