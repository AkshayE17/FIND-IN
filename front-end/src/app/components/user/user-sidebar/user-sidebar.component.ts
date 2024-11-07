
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; 
import { UserService } from '../../../services/userService';
import {  logoutUser } from '../../../state/user/user.action';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-sidebar.component.html',
  styleUrls: ['./user-sidebar.component.scss'] 
})
export class UserSidebarComponent {

  constructor(private userService: UserService, private router: Router,private store:Store) {}

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
        this.userService.clearUserData(); 
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
        this.router.navigate(['/']); 
      }
    });
  }
}
