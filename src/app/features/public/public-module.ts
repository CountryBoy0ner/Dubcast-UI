import { NgModule } from '@angular/core';
import { PublicRoutingModule } from './public-routing-module';
import { SharedModule } from '../../shared/shared.module';

import { PublicLayout } from './layout/public-layout/public-layout';
import { RadioPage } from './pages/radio-page/radio-page';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { ChatModule } from './chat/chat.module';
import { RadioWidgetModule } from './radio/radio-widget.module';

@NgModule({
  imports: [SharedModule, PublicRoutingModule, ChatModule, RadioWidgetModule, PublicLayout, RadioPage, LoginPage, RegisterPage, ProfilePage],
})
export class PublicModule {}
