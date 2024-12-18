import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-id',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-id.component.html',
  styleUrls: ['./room-id.component.scss'],
})
export class RoomIdComponent implements AfterViewInit, OnDestroy {
  recruiterName: string | undefined = '';
  roomId: string | null = '';
  private zegoInstance: any = null;
  isHost = false; // Determine if the current user is the host
  waitingParticipants: { id: string; name: string }[] = []; // List of participants waiting for approval

  @ViewChild('myMeeting', { static: true }) myMeetingElement!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.recruiterName = this.authService.getRecruiterData()?.name || 'Guest';

    if (this.roomId) {
      this.initializeVideoCall();
    } else {
      console.error('Room ID not available');
    }
  }

  initializeVideoCall(): void {
    if (this.zegoInstance) {
      console.warn('Video call already initialized.');
      return;
    }

    const myMeeting = async (element: HTMLElement) => {
      const appID = environment.ZEGO_APP_ID;
      const serverSecret = environment.ZEGO_SERVER_SECRET;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        this.roomId!,
        Date.now().toString(),
        this.recruiterName
      );

      this.zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

      this.zegoInstance.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Copy Link',
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        onLeaveRoom: () => {
          this.navigateToHome();
        },
        onUserJoin: (users: any[]) => {
          this.handleUserJoin(users);
        },
        onUserLeave: (users: any[]) => {
          this.handleUserLeave(users);
        },
      });

      // Determine host status
      this.isHost = !this.zegoInstance.getRoomInfo()?.host;
    };

    if (this.myMeetingElement?.nativeElement) {
      myMeeting(this.myMeetingElement.nativeElement);
    } else {
      console.error('Video container not found!');
    }
  }

  handleUserJoin(users: any[]): void {
    if (this.isHost) {
      this.waitingParticipants.push(...users.map(user => ({ id: user.id, name: user.name })));
    }
  }

  handleUserLeave(users: any[]): void {
    this.waitingParticipants = this.waitingParticipants.filter(
      participant => !users.find(user => user.id === participant.id)
    );
  }

  approveParticipant(participant: { id: string; name: string }): void {
    this.zegoInstance.approveUser(participant.id);
    this.waitingParticipants = this.waitingParticipants.filter(p => p.id !== participant.id);
  }

  rejectParticipant(participant: { id: string; name: string }): void {
    this.zegoInstance.rejectUser(participant.id);
    this.waitingParticipants = this.waitingParticipants.filter(p => p.id !== participant.id);
  }

  ngOnDestroy(): void {
    if (this.zegoInstance) {
      this.zegoInstance.destroy();
      this.zegoInstance = null;
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
