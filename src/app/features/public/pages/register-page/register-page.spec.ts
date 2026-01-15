import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { RegisterPage } from './register-page';
import { AuthService } from '../../../../core/auth/auth.service';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage, ReactiveFormsModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
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

  it('should be invalid if email is not a valid email', () => {
    const email = component.form.get('email');
    email?.setValue('test');
    expect(email?.valid).toBeFalsy();
  });

  it('should be invalid if password is less than 6 characters', () => {
    const password = component.form.get('password');
    password?.setValue('12345');
    expect(password?.valid).toBeFalsy();
  });

  it('should have an error if passwords do not match', () => {
    component.form.get('email')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');
    component.form.get('confirmPassword')?.setValue('wrongpassword');
    component.submit();
    expect(component.error).toBe('Passwords do not match');
  });

  it('should call auth.register on submit with valid form', () => {
    vi.spyOn(authService, 'register').mockReturnValue(of({} as any));

    component.form.get('email')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');
    component.form.get('confirmPassword')?.setValue('password');

    component.submit();

    expect(authService.register).toHaveBeenCalledWith('test@test.com', 'password');
  });

  it('should navigate to /radio on successful registration', () => {
    vi.spyOn(authService, 'register').mockReturnValue(of({} as any));
    vi.spyOn(router, 'navigate').mockResolvedValue(true as any);

    component.form.get('email')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');
    component.form.get('confirmPassword')?.setValue('password');

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/radio']);
  });

  it('should set error message on failed registration', () => {
    vi.spyOn(authService, 'register').mockReturnValue(
      throwError(() => ({ error: { message: 'Email already exists' } })),
    );

    component.form.get('email')?.setValue('test@test.com');
    component.form.get('password')?.setValue('password');
    component.form.get('confirmPassword')?.setValue('password');

    component.submit();

    expect(component.error).toBe('Email already exists');
  });

  it('should not call auth.register on submit with invalid form', () => {
    vi.spyOn(authService, 'register').mockReturnValue(of({} as any));

    component.submit();

    expect(authService.register).not.toHaveBeenCalled();
  });
});
