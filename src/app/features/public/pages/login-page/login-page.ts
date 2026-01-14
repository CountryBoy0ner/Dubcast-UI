import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  error = '';
  form: FormGroup = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

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
