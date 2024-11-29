import Swal from "sweetalert2";
import { logoutUser } from "../../../state/user/user.action";
import { AuthService } from "../../../services/auth.service";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { RouterOutlet } from "@angular/router";
import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { SideBarComponent } from "../side-bar/side-bar.component";


@Component({
  selector: 'app-adminlayout',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,SideBarComponent],
  templateUrl: './adminlayout.component.html',
  styleUrls: ['./adminlayout.component.scss']
})

export class AdminlayoutComponent {
  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router
  ) {}

  handleLogout() {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Log Out'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.clearAdminData();
        this.store.dispatch(logoutUser());
        Swal.fire({
          icon: 'success',
          title: 'Logged Out Successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        this.router.navigate(['/admin/login']);
      }
    });
  }
}