import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-room',
  standalone: true,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements AfterViewInit, OnDestroy {
  userName:string|undefined='';
  roomId: string | null = '';
  private zegoInstance: any = null;
  
  @ViewChild('myMeeting', { static: true }) myMeetingElement!: ElementRef;
  
  constructor(private route: ActivatedRoute, private router: Router,private authService: AuthService) {}
  
  ngAfterViewInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.userName = this.authService.getUserData()?.name || 'Guest';
    console.log("recruiter name",this.userName);


    if (this.roomId) {
      this.initializeVideoCall();
    } else {
      console.error('Room ID not available');
    }
  }

  initializeVideoCall(): void {
    // Ensure we only initialize once
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
        this.userName
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
      });
    };
  
    if (this.myMeetingElement?.nativeElement) {
      myMeeting(this.myMeetingElement.nativeElement);
    } else {
      console.error('Video container not found!');
    }
  }

  ngOnDestroy(): void {
    // Properly clean up the Zego instance when the component is destroyed
    if (this.zegoInstance) {
      this.zegoInstance.destroy();
      this.zegoInstance = null;
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/']); // Navigate back to the home page
  }
}