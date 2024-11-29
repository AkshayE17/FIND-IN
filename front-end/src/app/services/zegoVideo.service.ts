import { Injectable } from '@angular/core';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZegoVideoService {
  private apiUrl = 'http://localhost:8888';
  private APP_ID: string = environment.ZEGO_APP_ID.toString();
  private SERVER_SECRET: string = environment.ZEGO_SERVER_SECRET;

  private zegoUIKit: ZegoUIKitPrebuilt | null = null;

  constructor(private http: HttpClient) {}

  // Initialize Zego SDK
  private initializeZego(): Observable<ZegoUIKitPrebuilt> {
    // Pass APP_ID directly if it's already a string
    return of(ZegoUIKitPrebuilt.create(this.APP_ID)).pipe(
      tap(zegoKit => {
        this.zegoUIKit = zegoKit;
        console.log('Zego SDK Fully Initialized');
      }),
      catchError(error => {
        console.error('Zego SDK Full Initialization Failed:', error);
        return throwError(() => new Error('Zego SDK Initialization Failed'));
      })
    );
  }
  

  // Modified token generation
  generateToken(roomId: string, userId: string | null, userName: string): Observable<string> {
    console.log('Token Generation Details:', { 
      roomId, 
      userId, 
      userName,
      appId: this.APP_ID
    });
  
    return this.http.post<{token: string}>(`${this.apiUrl}/chat/generate-token`, { 
      roomId, 
      userId, 
      userName,
      appId: this.APP_ID
    }).pipe(
      tap(response => console.log('Full Token Response:', response)),
      map(response => {
        if (!response.token) {
          throw new Error('No token generated');
        }
        return response.token;
      }),
      catchError(error => {
        console.error('Comprehensive Token Generation Error:', {
          error: error.message,
          status: error.status,
          response: error.error
        });
        return throwError(() => error);
      })
    );
  }

  // Refined join call method
  joinCall(roomId: string, userId: string | null, userName: string = 'User'): Observable<void> {
    return this.initializeZego().pipe(
      switchMap(zegoKit => {
        console.log('Zego Kit Ready, Generating Token');
        return this.generateToken(roomId, userId, userName);
      }),
      switchMap(token => {
        console.log('Token Generated, Preparing Video Call');
        return from(this.prepareVideoCall(this.zegoUIKit!, roomId, userId, userName, token));
      }),
      catchError(error => {
        console.error('Comprehensive Video Call Error:', error);
        this.leaveCall();
        throw error;
      })
    );
  }

  // Existing prepareVideoCall method with enhanced logging
  private prepareVideoCall(
    zegoKit: ZegoUIKitPrebuilt, 
    roomId: string, 
    userId: string | null, 
    userName: string, 
    token: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Preparing Video Call with:', { 
          roomId, 
          userId, 
          userName, 
          tokenLength: token.length 
        });

        const container = this.createVideoContainer();
        document.body.appendChild(container);

        zegoKit.joinRoom({
          container: container,
          scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
          showPreJoinView: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          maxUsers: 2,
          userID: userId || Date.now().toString(),
          userName: userName,
          roomID: roomId,
          token: token,
          onJoinRoom: () => {
            console.log('Successfully Joined Video Room');
            resolve();
          },
          onLeaveRoom: () => {
            console.log('Left Video Room');
            this.leaveCall();
          }
        }as any);
      } catch (error) {
        console.error('Video Call Preparation Catastrophic Error:', error);
        this.leaveCall();
        reject(error);
      }
    });
  }
  // Create video container
  private createVideoContainer(): HTMLDivElement {
    // Remove any existing containers
    const existingContainers = document.querySelectorAll('#video-container');
    existingContainers.forEach(container => container.remove());

    // Create a new container for the video call
    const container = document.createElement('div');
    container.id = 'video-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '1000';
    container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';

    // Create a close button for the container
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Call';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.zIndex = '1001';
    closeButton.style.padding = '10px';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.addEventListener('click', () => {
      this.leaveCall();
    });

    container.appendChild(closeButton);

    return container;
  }

  private clearExistingVideoContainers(): void {
    const existingContainers = document.querySelectorAll('#video-container');
    existingContainers.forEach(container => container.remove());
  }

  // Leave the call and clean up resources
  leaveCall(): void {
    try {
      // Destroy Zego SDK instance
      if (this.zegoUIKit) {
        this.zegoUIKit.destroy();
        this.zegoUIKit = null;
      }

      // Remove video container
      const container = document.getElementById('video-container');
      if (container) {
        container.remove();
      }
    } catch (error) {
      console.error('Error leaving video call:', error);
    }
  }
}