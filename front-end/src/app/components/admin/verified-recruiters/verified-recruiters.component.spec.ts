import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedRecruitersComponent } from './verified-recruiters.component';

describe('VerifiedRecruitersComponent', () => {
  let component: VerifiedRecruitersComponent;
  let fixture: ComponentFixture<VerifiedRecruitersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifiedRecruitersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifiedRecruitersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
