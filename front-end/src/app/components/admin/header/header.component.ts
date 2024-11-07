import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { logoutUser } from '../../../state/user/user.action';
import { Store } from '@ngrx/store';
import { AdminService } from '../../../services/adminService';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private store:Store,private adminService:AdminService,private router:Router){}

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.clearAdminData(); 
        this.store.dispatch(logoutUser());
        Swal.fire({
          icon: 'success',
          title: 'Logged out!',
          text: 'You have been logged out.',
          toast:true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000 ,
    
        });
        this.router.navigate(['/admin/login']); 
      }
    });
  }
}
