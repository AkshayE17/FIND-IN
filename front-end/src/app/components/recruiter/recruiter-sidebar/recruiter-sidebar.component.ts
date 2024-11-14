import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { logoutRecruiter } from '../../../state/recruiter/recruiter.action';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recruiter-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './recruiter-sidebar.component.html',
  styleUrl: './recruiter-sidebar.component.scss'
})
export class RecruiterSidebarComponent {
  


  constructor(
    private authService:AuthService,
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
        
        this.authService.clearRecruiterData(); 
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
