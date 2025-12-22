import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsWsService } from '../../../core/analytics/data-access/analytics-ws.service';
import { OnlineStatsDto } from '../../../core/analytics/models/online-stats.model';

@Component({
  selector: 'app-online-listeners',
  templateUrl: './online-listeners.component.html',
  styleUrls: ['./online-listeners.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineListenersComponent implements OnInit {
  stats$!: Observable<OnlineStatsDto | null>;

  constructor(private analytics: AnalyticsWsService) {}

  ngOnInit(): void {
    this.stats$ = this.analytics.stats$;
    this.analytics.start();
  }
}
