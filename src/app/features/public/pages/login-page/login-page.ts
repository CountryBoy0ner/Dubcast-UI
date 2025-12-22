import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  form: UntypedFormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]], //todo
    });
  }

  submit(): void {
    console.log("Login form submitted");
    
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('payload', this.form.getRawValue());
      return;
    }

    this.loading = true;
    const v = this.form.getRawValue();

    this.auth.login(v.emailOrUsername, v.password).subscribe({
      next: () => {
        console.log("successful login");

        this.loading = false;
        this.router.navigate(['/radio']);
      },
      error: (e: any) => {
        this.loading = false;
        // e.error.message — если пришла ошибка от бэка (HttpErrorResponse)
        // e.message — если это обычный Error (например, выброшен вручную в AuthService)
        // !e.error — проверка, чтобы не показывать технические сообщения HttpErrorResponse (типа "Http failure...")
        this.error = e?.error?.message || (!e.error && e.message) || 'Failed to login';
        this.cdr.detectChanges();
        console.log(this.error);
      },
    });
  }
}
