import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedsuccessComponent } from './verifiedsuccess.component';

describe('VerifiedsuccessComponent', () => {
  let component: VerifiedsuccessComponent;
  let fixture: ComponentFixture<VerifiedsuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifiedsuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifiedsuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
