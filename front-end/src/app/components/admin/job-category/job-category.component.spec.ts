import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCategoryComponent } from './job-category.component';

describe('JobCategoryComponent', () => {
  let component: JobCategoryComponent;
  let fixture: ComponentFixture<JobCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
