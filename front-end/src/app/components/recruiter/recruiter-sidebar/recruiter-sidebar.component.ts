import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { RecruiterService } from '../../../services/recruiterService';
import { logoutRecruiter } from '../../../state/recruiter/recruiter.action';

@Component({
  selector: 'app-recruiter-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './recruiter-sidebar.component.html',
  styleUrl: './recruiter-sidebar.component.scss'
})
export class RecruiterSidebarComponent {
  


  constructor(
    private recruiterService:RecruiterService,
    private store: Store,
    private router: Router
  ) {}

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.recruiterService.clearRecruiterData(); 
        this.store.dispatch(logoutRecruiter());
        Swal.fire({
          icon: 'success',
          title: 'Logged out!',
          text: 'You have been logged out.',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
        });

        // Navigate to home or login page
        this.router.navigate(['/']);
      }
    });
  }
}
