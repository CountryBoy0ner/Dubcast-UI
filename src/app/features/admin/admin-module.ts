import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { AdminRoutingModule } from './admin-routing-module';

import { AdminLayout } from './layout/admin-layout/admin-layout';
import { AdminDashboardPage } from './pages/admin-dashboard-page/admin-dashboard-page';

@NgModule({
  declarations: [AdminLayout, AdminDashboardPage],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}
