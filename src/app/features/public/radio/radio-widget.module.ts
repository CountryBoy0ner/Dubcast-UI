import { NgModule } from '@angular/core';
import { ChatModule } from '../chat/chat.module';
import { SharedModule } from '../../../shared/shared.module';

import { RadioWidgetComponent } from './ui/radio-widget/radio-widget.component';

@NgModule({
  imports: [SharedModule, ChatModule, RadioWidgetComponent],
  exports: [RadioWidgetComponent],
})
export class RadioWidgetModule {}
