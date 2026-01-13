import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  standalone: false,
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  loading = false;
  error = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Basic login form with validation
    this.form = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  submit(): void {
    // Clear previous error
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const v = this.form.getRawValue();

    this.auth.login(v.emailOrUsername, v.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/radio']);
      },
        error: (_e) => {
          this.loading = false;
          // Prefer backend-provided message when available, fall back to Error.message
          this.error = _e?.error?.message || (!_e.error && _e.message) || 'Failed to login';
          this.cdr.detectChanges();
      },
    });
  }
}
