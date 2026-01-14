import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioWidgetComponent } from './radio-widget.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RadioWidgetComponent', () => {
  let component: RadioWidgetComponent;
  let fixture: ComponentFixture<RadioWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioWidgetComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
