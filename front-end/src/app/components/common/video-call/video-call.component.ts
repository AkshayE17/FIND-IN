// import { Component, Input, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-video-call',
//   standalone: true,
//   imports: [],
//   templateUrl: './video-call.component.html',
//   styleUrl: './video-call.component.scss'
// })
// export class VideoCallComponent implements OnInit, OnDestroy {
//   @Input() roomId!: string;
//   @Input() userId!: string;
//   @Input() userName!: string;

//   localStream: MediaStream | null = null;
//   remoteStream: MediaStream | null = null;

//   constructor(private videoCallService: VideoCallService) {}

//   async ngOnInit() {
//     try {
//       await this.videoCallService.initializeCall(this.userId, this.userName);
//       await this.videoCallService.startVideoCall(this.roomId, this.userId);
//     } catch (error) {
//       console.error('Video call initialization failed', error);
//     }
//   }

//   async endCall() {
//     await this.videoCallService.endCall();
//   }

//   ngOnDestroy() {
//     this.videoCallService.endCall();
//   }
// }
