import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFilterComponent } from './admin-filter.component';

describe('AdminFilterComponent', () => {
  let component: AdminFilterComponent;
  let fixture: ComponentFixture<AdminFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
