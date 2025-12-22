import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserIdentityService } from '../../../../core/user/user-identity.service';
import { ProfileStoreService } from '../../profile/state/profile-store.service';
import { UserProfileResponse } from '../../profile/models/profile.model';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  isAuth$!: Observable<boolean>;
  loading$!: Observable<boolean>;
  saving$!: Observable<boolean>;
  error$!: Observable<string | null>;
  profile$!: Observable<UserProfileResponse | null>;

  form: UntypedFormGroup;

  private currentUsername = '';
  private currentBio = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private identity: UserIdentityService,
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
    this.isAuth$ = this.auth.isAuthenticated$;
    this.loading$ = this.store.loading$;
    this.saving$ = this.store.saving$;
    this.error$ = this.store.error$;
    this.profile$ = this.store.profile$;

    // грузим профиль
    this.store.load().subscribe();

    // когда профиль пришёл — заполняем форму и запоминаем "текущие" значения
    this.profile$.subscribe((p) => {
      if (!p) return;

      const u = (p.username ?? '').trim();
      const b = (p.bio ?? '').trim();

      this.currentUsername = u;
      this.currentBio = b;

      // не перетираем ввод пользователя, если он уже начал редактировать
      if (!this.form.dirty) {
        this.form.patchValue({ username: u, bio: b }, { emitEvent: false });
        this.form.markAsPristine();
      }
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

  saveUsername(): void {
    const u = String(this.form.value.username ?? '').trim();

    this.form.get('username')?.markAsTouched();
    if (this.form.get('username')?.invalid) return;

    // важно: не отправляем если не изменилось
    if (!this.usernameChanged()) return;

    this.store.saveUsername(u).subscribe({
      next: () => {
        // обновляем identity, чтобы хедер сразу показал новый username
        this.identity.refresh().subscribe();
        // store.load() уже вызывается внутри store.saveUsername() (если ты так сделал),
        // но даже если нет — identity всё равно обновит хедер.
        this.currentUsername = u;
        this.form.get('username')?.markAsPristine();
      },
    });
  }

  saveBio(): void {
    const b = String(this.form.value.bio ?? '');

    this.form.get('bio')?.markAsTouched();
    if (this.form.get('bio')?.invalid) return;

    if (!this.bioChanged()) return;

    this.store.saveBio(b).subscribe({
      next: () => {
        this.currentBio = b.trim();
        this.form.get('bio')?.markAsPristine();
      },
    });
  }
}
