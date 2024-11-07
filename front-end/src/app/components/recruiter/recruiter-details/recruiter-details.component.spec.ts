import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterDetailsComponent } from './recruiter-details.component';

describe('RecruiterDetailsComponent', () => {
  let component: RecruiterDetailsComponent;
  let fixture: ComponentFixture<RecruiterDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
