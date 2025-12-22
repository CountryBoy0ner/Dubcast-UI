import { NgModule } from '@angular/core';
import { ChatModule } from '../chat/chat.module';
import { SharedModule } from '../../../shared/shared.module';

import { RadioWidgetComponent } from './ui/radio-widget/radio-widget.component';

@NgModule({
  declarations: [RadioWidgetComponent],
  imports: [SharedModule, ChatModule],
  exports: [RadioWidgetComponent],
})
export class RadioWidgetModule {}
