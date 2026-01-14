import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { QueueStoreService } from '../../queue/state/queue-store.service';

@Component({
  selector: 'app-queue-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './queue-page.html',
  styleUrls: ['./queue-page.scss'],
})
export class QueuePage implements OnInit {
  private store = inject(QueueStoreService);

  vm$ = this.store.vm$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.store.loadAroundNow(2).subscribe();
  }

  trackByEntryId(_: number, e: { id: number }): number {
    return e.id;
  }
}
