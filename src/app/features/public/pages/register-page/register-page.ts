import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  standalone: false,
})
export class RegisterPage {
  loading = false;
  error = '';
  form: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    if (val.password !== val.confirmPassword) {
      this.error = 'Пароли не совпадают';
      return;
    }

    this.loading = true;
    this.auth.register(val.email, val.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/radio']);
      },
      error: (e: any) => {
        this.loading = false;
        if (e.status === 0) {
          this.error = 'Сервер недоступен. Проверьте соединение.';
        } else {
          this.error = e?.error?.message || 'Не удалось зарегистрироваться';
        }
        this.cdr.detectChanges();
      },
    });
  }
}