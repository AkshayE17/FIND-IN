import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortListComponent } from './short-list.component';

describe('ShortListComponent', () => {
  let component: ShortListComponent;
  let fixture: ComponentFixture<ShortListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
