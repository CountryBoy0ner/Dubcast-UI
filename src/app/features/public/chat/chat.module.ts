import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatComponent } from './ui/chat/chat.component';
import { ChatMessageComponent } from './ui/chat-message/chat-message.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ChatComponent, ChatMessageComponent],
  exports: [ChatComponent],
})
export class ChatModule {}
