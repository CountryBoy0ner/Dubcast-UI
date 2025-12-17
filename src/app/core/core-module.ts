import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MessageService } from 'primeng/api';

@NgModule({
  providers: [MessageService]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent?: CoreModule) {
    if (parent) throw new Error('CoreModule импортируется только в AppModule');
  }
}
