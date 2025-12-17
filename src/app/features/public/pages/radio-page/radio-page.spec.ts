import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioPage } from './radio-page';

describe('RadioPage', () => {
  let component: RadioPage;
  let fixture: ComponentFixture<RadioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RadioPage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RadioPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
