import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppState } from '../../../state/app.state';
import { selectUser } from '../../../state/user/user.selector';
import { IUser } from '../../../state/user/user.state';
import { selectRecruiter } from '../../../state/recruiter/recruiter.selector';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{
  user$?: Observable<IUser | null>; 
  recruiter$?: Observable<IRecruiter | null>;
  isMenuOpen = false;

  constructor(private store: Store<AppState>, private router: Router) {
  }

  ngOnInit(): void {
    this.user$ = this.store.select(selectUser);
    this.recruiter$ = this.store.select(selectRecruiter);
  }
  goToUserDetails() {
    this.router.navigate(['/user/dashboard/user-details']);
    this.isMenuOpen = false;
  }

  goToRecruiterDetails() {
    this.router.navigate(['/recruiter/dashboard/recruiter-details']); 
    this.isMenuOpen = false;
  }


  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
