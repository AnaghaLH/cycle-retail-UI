import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleFormComponent } from './cycle-form.component';

describe('CycleFormComponent', () => {
  let component: CycleFormComponent;
  let fixture: ComponentFixture<CycleFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CycleFormComponent]
    });
    fixture = TestBed.createComponent(CycleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
