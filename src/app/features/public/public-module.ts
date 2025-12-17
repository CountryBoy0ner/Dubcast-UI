import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { PublicRoutingModule } from './public-routing-module';

import { PublicLayout } from './layout/public-layout/public-layout';
import { RadioPage } from './pages/radio-page/radio-page';
import { PlaylistsPage } from './pages/playlists-page/playlists-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { ProfilePage } from './pages/profile-page/profile-page';


@NgModule({
  declarations: [
    PublicLayout,
    RadioPage,
    PlaylistsPage,
    LoginPage,
    RegisterPage,
    ProfilePage,
  ],
  imports: [
    SharedModule,
    PublicRoutingModule,
  ],
})
export class PublicModule {}
