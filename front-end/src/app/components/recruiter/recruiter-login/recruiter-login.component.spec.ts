import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterLoginComponent } from './recruiter-login.component';

describe('RecruiterLoginComponent', () => {
  let component: RecruiterLoginComponent;
  let fixture: ComponentFixture<RecruiterLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
