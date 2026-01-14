import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsWsService } from '../../../core/analytics/data-access/analytics-ws.service';
import { OnlineStatsDto } from '../../../core/analytics/models/online-stats.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-online-listeners',
  templateUrl: './online-listeners.component.html',
  styleUrls: ['./online-listeners.component.scss'],
    standalone: true,
    imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineListenersComponent implements OnInit {
  private analytics = inject(AnalyticsWsService);

  stats$!: Observable<OnlineStatsDto | null>;

  ngOnInit(): void {
    this.stats$ = this.analytics.stats$;
    this.analytics.start();
  }
}
