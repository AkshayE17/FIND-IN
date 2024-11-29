import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { logoutRecruiter } from '../../../state/recruiter/recruiter.action';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiter-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './recruiter-sidebar.component.html',
  styleUrls: ['./recruiter-sidebar.component.scss']
})
export class RecruiterSidebarComponent implements OnInit {
  isMobile: boolean = false;
  isExpanded: boolean = false;

  constructor(
    private authService: AuthService,
    private store: Store,
    private router: Router
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isExpanded = false;
    }
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit() {
    this.checkScreenSize();
  }

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
        this.router.navigate(['/']);
      }
    });
  }
}