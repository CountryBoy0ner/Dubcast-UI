import { Component, OnInit, signal } from '@angular/core';
import { AnalyticsPresenceService } from './core/analytics/state/analytics-presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('dubcast-ui');

  constructor(private presence: AnalyticsPresenceService) {}

  ngOnInit(): void {
    this.presence.init();
  }
}
