import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent {
  roomId: string = '';

  constructor(private router: Router) {}

  // Generate a random Room ID
  generateRoomId(): void {
    this.roomId = Math.random().toString(36).substring(2, 10); // Random 8-character string
  }

  // Navigate to the Room
  joinRoom(): void {
    if (this.roomId.trim()) {
      this.router.navigate([`/recruiter/room/${this.roomId}`]);
    } else {
      alert('Please enter a valid Room ID');
    }
  }

}
