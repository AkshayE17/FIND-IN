import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterRegisterComponent } from './recruiter-register.component';

describe('RecruiterRegisterComponent', () => {
  let component: RecruiterRegisterComponent;
  let fixture: ComponentFixture<RecruiterRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
