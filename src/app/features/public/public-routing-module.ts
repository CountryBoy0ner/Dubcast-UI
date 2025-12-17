import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicLayout } from './layout/public-layout/public-layout';
import { RadioPage } from './pages/radio-page/radio-page';
import { PlaylistsPage } from './pages/playlists-page/playlists-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { ProfilePage } from './pages/profile-page/profile-page';

const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'radio' },
      { path: 'radio', component: RadioPage },
      { path: 'playlists', component: PlaylistsPage },
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'profile', component: ProfilePage },
      { path: '**', redirectTo: 'radio' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
