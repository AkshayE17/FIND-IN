// In recruiter-details.component.ts
import { Component } from '@angular/core';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { AppState } from '../../../state/app.state';
import { Store } from '@ngrx/store';
import { selectRecruiter } from '../../../state/recruiter/recruiter.selector';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiter-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recruiter-details.component.html',
  styleUrls: ['./recruiter-details.component.scss']
})
export class RecruiterDetailsComponent {
  recruiter$: Observable<IRecruiter | null>; 

  constructor(private store: Store<AppState>) {
    this.recruiter$ = this.store.select(selectRecruiter);
  }
}
