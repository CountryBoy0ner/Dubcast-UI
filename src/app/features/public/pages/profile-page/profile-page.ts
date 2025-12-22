import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileStoreService } from '../../profile/state/profile-store.service';
import { UserProfileResponse } from '../../profile/models/profile.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  profile$!: Observable<UserProfileResponse | null>;
  loading$!: Observable<boolean>;
  saving$!: Observable<boolean>;
  error$!: Observable<string | null>;
  isAuth$!: Observable<boolean>;


  form: UntypedFormGroup;
  private patchedOnce = false;
  private currentUsername = '';
  private currentBio = '';



  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public store: ProfileStoreService
  ) {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9_.]+$/),
        ],
      ],
      bio: ['', [Validators.maxLength(512)]],
    });
  }

  ngOnInit(): void {
    this.profile$ = this.store.profile$;
    this.loading$ = this.store.loading$;
    this.saving$ = this.store.saving$;
    this.error$ = this.store.error$;
    this.isAuth$ = this.auth.isAuthenticated$;
    this.profile$.subscribe(p => {
      this.currentUsername = (p?.username ?? '').trim();
    });


    // грузим профиль
    this.store.load().subscribe({
      next: (p) => this.patchFormIfNeeded(p),
      error: () => { },
    });

    // если store обновился (после save), обновим форму, но аккуратно
    this.profile$.subscribe((p) => this.patchFormIfNeeded(p));
  }

  private patchFormIfNeeded(p: UserProfileResponse | null): void {
    if (!p) return;

    // чтобы не перетирать ввод пользователя — патчим только 1 раз,
    // и дальше только когда форма "чистая"
    if (!this.patchedOnce || !this.form.dirty) {
      this.form.patchValue({
        username: p.username ?? '',
        bio: p.bio ?? '',
      }, { emitEvent: false });

      this.form.markAsPristine();
      this.patchedOnce = true;
    }
  }

  reload(): void {
    this.store.load().subscribe();
  }

  saveUsername(): void {
    const username = String(this.form.value.username || '').trim();

    this.form.get('username')?.markAsTouched();
    if (this.form.get('username')?.invalid) return;

    if (username === this.currentUsername) {
      return;
    }

    this.store.saveUsername(username).subscribe(() => {
      this.currentUsername = username;
      this.form.get('username')?.markAsPristine();
    });
  }

  usernameChanged(): boolean {
    const u = String(this.form.value.username ?? '').trim();
    return u.length > 0 && u !== this.currentUsername;
  }

  bioChanged(): boolean {
    const b = String(this.form.value.bio ?? '').trim();
    return b !== this.currentBio;
  }

  saveBio(): void {
    const bio = String(this.form.value.bio ?? '');
    this.form.get('bio')?.markAsTouched();
    if (this.form.get('bio')?.invalid) return;

    this.store.saveBio(bio).subscribe();
  }
}
