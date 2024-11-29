import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterChatComponent } from './recruiter-chat.component';

describe('RecruiterChatComponent', () => {
  let component: RecruiterChatComponent;
  let fixture: ComponentFixture<RecruiterChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruiterChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
