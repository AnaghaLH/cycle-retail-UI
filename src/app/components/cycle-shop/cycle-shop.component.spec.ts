import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleShopComponent } from './cycle-shop.component';

describe('CycleShopComponent', () => {
  let component: CycleShopComponent;
  let fixture: ComponentFixture<CycleShopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CycleShopComponent]
    });
    fixture = TestBed.createComponent(CycleShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
