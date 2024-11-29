import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ZegoVideoService } from '../../../services/zegoVideo.service';

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
}

interface Message {
  _id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  seen: boolean;
}

@Component({
  selector: 'app-user-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})
export class UserChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatRooms: ChatRoom[] = [];
  selectedChatRoom: ChatRoom | null = null;
  currentUserId: string | null = null;
  messages: Message[] = [];
  newMessageText: string = '';
  type: string = 'User';
  isMobileView: boolean = false;
  isRoomListVisible: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private zegoService:ZegoVideoService
  ) {
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView.bind(this));
  }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.loadChatRooms();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('resize', this.checkMobileView.bind(this));
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
  }

  toggleRoomList() {
    this.isRoomListVisible = !this.isRoomListVisible;
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
          },
          error: (err) => console.error('Error loading chat rooms', err)
        });
    }
  }

  selectChatRoom(room: ChatRoom) {
    this.selectedChatRoom = room;
    if (room._id) {
      this.chatService.joinRoom(room._id);
      this.loadChatRoomMessages(room._id);
      
      // For mobile view, hide room list after selecting a room
      if (this.isMobileView) {
        this.isRoomListVisible = false;
      }
    }
  }

  loadChatRoomMessages(chatRoomId: string) {
    this.chatService.getChatRoomMessages(chatRoomId)
      .subscribe({
        next: (messages: Message[]) => {
          this.messages = messages;
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => console.error('Error loading messages', err)
      });
  }

  scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
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
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  setupSocketListeners() {
    const messageReceivedSub = this.chatService.onMessageReceived()
      .subscribe(message => {
        if (this.selectedChatRoom && message.chatRoomId === this.selectedChatRoom._id) {
          this.messages.push(message);
          setTimeout(() => this.scrollToBottom(), 100);
        }
        this.loadChatRooms();
      });

    const typingSub = this.chatService.onTyping()
      .subscribe(data => {
        const room = this.chatRooms.find(r => r._id === data.chatRoomId);
        if (room) {
          room.isTyping = data.senderId !== this.currentUserId;
        }
      });

    this.subscriptions.push(messageReceivedSub, typingSub);
  }

  onTyping() {
    if (this.selectedChatRoom) {
      this.chatService.emitTyping(this.selectedChatRoom._id, this.currentUserId);
    }
  }

  calculateUnseenCount(room: ChatRoom): number {
    return 0; // Placeholder
  }

  getOtherUser(room: ChatRoom) {
    return this.currentUserId === room.recruiterId._id 
      ? room.jobSeekerId 
      : room.recruiterId;
  }



  initiateVideoCall() {
    if (this.selectedChatRoom) {
      const userId = this.authService.getUserId();
      const roomId = `video_call_${userId}_${this.getOtherUser(this.selectedChatRoom)._id}`;
      
      this.zegoService.joinCall(
        roomId, 
        userId, 
        'Job Seeker Name' 
      );
    }
  }
}