import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseLoginComponent } from './base-login.component';

describe('BaseLoginComponent', () => {
  let component: BaseLoginComponent;
  let fixture: ComponentFixture<BaseLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
