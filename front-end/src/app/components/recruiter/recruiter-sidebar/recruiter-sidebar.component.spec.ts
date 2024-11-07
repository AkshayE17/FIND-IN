import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterSidebarComponent } from './recruiter-sidebar.component';

describe('RecruiterSidebarComponent', () => {
  let component: RecruiterSidebarComponent;
  let fixture: ComponentFixture<RecruiterSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
