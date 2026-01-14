import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioWidgetComponent } from '../../radio/ui/radio-widget/radio-widget.component';

@Component({
  selector: 'app-radio-page',
  templateUrl: './radio-page.html',
  standalone: true,
  imports: [CommonModule, RadioWidgetComponent],
  styleUrls: ['./radio-page.scss'],
})
export class RadioPage {}
