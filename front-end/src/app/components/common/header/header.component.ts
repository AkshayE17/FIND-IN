import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { selectUser } from '../../../state/user/user.selector';
import { AppState } from '../../../state/app.state';
import { IUser } from '../../../state/user/user.state';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { selectRecruiter } from '../../../state/recruiter/recruiter.selector';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  user$: Observable<IUser | null>; 
  recruiter$: Observable <IRecruiter | null>
  isMenuOpen = false;

  constructor(private store: Store<AppState>, private router: Router) {
    this.user$ = this.store.select(selectUser);
    this.recruiter$ = this.store.select(selectRecruiter); 
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToProfile() {
    this.router.navigate(['/user/profile']); // Adjust the route to your user profile page
  }

  goToUserDetails(){}

  goToRecruiterDetails(){}
}
