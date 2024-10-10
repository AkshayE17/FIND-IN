import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-success',
  standalone: true,
  imports: [],
  templateUrl: './verify-success.component.html',
  styleUrl: './verify-success.component.scss'
})
export class VerifySuccessComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']); 
  }

  goToLogin() {
    this.router.navigate(['/recruiter/login']); 
}
}