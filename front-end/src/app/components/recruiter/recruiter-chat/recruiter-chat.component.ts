import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface ChatRoom {
  _id: string;
  jobSeekerId: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  recruiterId: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  lastMessage?: Message;
  unseenCount?: number;
  isTyping?: boolean;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  seen: boolean;
}

@Component({
  selector: 'app-recruiter-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-chat.component.html',
  styleUrls: ['./recruiter-chat.component.scss']
})
export class RecruiterChatComponent implements OnInit, OnDestroy {
  chatRooms: ChatRoom[] = [];
  selectedChatRoom: ChatRoom | null = null;
  currentUserId: string | null = null;
  messages: Message[] = [];
  newMessageText: string = '';
  type:string='Recruiter';
  userStatuses: { [userId: string]: string } = {};
  searchQuery: string = '';
filteredChatRooms: ChatRoom[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router:Router
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getRecruiterId();
    this.loadChatRooms();
    this.setupSocketListeners();
    this.filteredChatRooms=this.chatRooms;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadChatRooms() {
    if (this.currentUserId) {
      this.chatService.getUserChatRooms(this.currentUserId)
        .subscribe({
          next: (rooms: ChatRoom[]) => {
            this.chatRooms = rooms.map(room => ({
              ...room,
              isTyping: false,
              unseenCount: this.calculateUnseenCount(room)
            }));
            this.filteredChatRooms = this.chatRooms;
          },
          error: (err) => console.error('Error loading chat rooms', err)
        });
    }
  }


filterChatRooms() {
  if (!this.searchQuery.trim()) {
    this.filteredChatRooms = this.chatRooms;
    return;
  }

  const query = this.searchQuery.toLowerCase().trim();
  this.filteredChatRooms = this.chatRooms.filter(room => {
    const otherUser = this.getOtherUser(room);
    return otherUser.name.toLowerCase().includes(query);
  });
}


  selectChatRoom(room: ChatRoom) {
    this.selectedChatRoom = room;
    if (room._id) {
      this.chatService.joinRoom(room._id);
      this.loadChatRoomMessages(room._id);
    }
  }

  loadChatRoomMessages(chatRoomId: string) {
    this.chatService.getChatRoomMessages(chatRoomId)
      .subscribe({
        next: (messages: Message[]) => {
          this.messages = messages;
        },
        error: (err) => console.error('Error loading messages', err)
      });
  }

  sendMessage() {
    if (this.newMessageText.trim() && this.selectedChatRoom) {
      this.chatService.sendMessage(
        this.selectedChatRoom._id, 
        this.currentUserId, 
        this.newMessageText,
        this.type
      );
      this.newMessageText = '';
    }
  }

  async updateChatRooms() {
    if (this.currentUserId) {
      const rooms = await this.chatService.getUserChatRooms(this.currentUserId).toPromise();
      
      if (rooms) {  // Add null check
        this.chatRooms = rooms.map(room => ({
          ...room,
          unseenCount: 0,  // Default to 0 if undefined
          isOnline: this.isUserOnline(this.getOtherUser(room)._id)
        }));
  
        // Calculate unread counts for each room
        for (const room of this.chatRooms) {
          room.unseenCount = await this.chatService.getUnseenMessageCount(room._id, this.currentUserId).toPromise();
        }
      }
    }
  }

  setupSocketListeners() {
    // Message received listener
    const messageReceivedSub = this.chatService.onMessageReceived()
      .subscribe(message => {
        if (this.selectedChatRoom && message.chatRoomId === this.selectedChatRoom._id) {
          this.messages.push(message);
        }
        this.loadChatRooms(); // Refresh chat rooms to update last message
      });

    // Typing listener
    const typingSub = this.chatService.onTyping()
      .subscribe(data => {
        const room = this.chatRooms.find(r => r._id === data.chatRoomId);
        if (room) {
          room.isTyping = data.senderId !== this.currentUserId;
        }
      });

     // Update the user status subscription
  const userStatusSub = this.chatService.onUserStatusChanged()
  .subscribe(({ userId, status }: { userId: string, status: string }) => {
    this.userStatuses[userId] = status;
    
    // Update online status in chat rooms
    this.chatRooms.forEach(room => {
      if (this.getOtherUser(room)._id === userId) {
        room.isOnline = status === 'online';
      }
    });
  });


    this.subscriptions.push(messageReceivedSub, typingSub,userStatusSub);
  }

  onTyping() {
    if (this.selectedChatRoom) {
      this.chatService.emitTyping(this.selectedChatRoom._id, this.currentUserId);
    }
  }

  calculateUnseenCount(room: ChatRoom): number {
    // Implement logic to count unseen messages for this chat room
    return 0; // Placeholder
  }

  getOtherUser(room: ChatRoom) {
    return this.currentUserId === room.recruiterId._id 
      ? room.jobSeekerId 
      : room.recruiterId;
  }


  // Method to check if another user is online
  isUserOnline(userId: string): boolean {
    return this.userStatuses[userId] === 'online';
  }

   initiateVideoCall() {
    this.router.navigate(['recruiter/dashboard/video-call']);
  }


  

}