import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verifiedsuccess',
  standalone: true,
  imports: [],
  templateUrl: './verifiedsuccess.component.html',
  styleUrl: './verifiedsuccess.component.scss'
})
export class VerifiedsuccessComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']); 
  }

  goToLogin() {
    this.router.navigate(['/user/login']); 
  }
}
