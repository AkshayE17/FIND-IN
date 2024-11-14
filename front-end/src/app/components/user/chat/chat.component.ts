import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ChatService, IMessage } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ CommonModule,FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: IMessage[] = [];
  newMessage: string = '';
  currentUserId: string | null ;
  otherUserId: string;
  private subscriptions: Subscription = new Subscription();
  private polling: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.getRecruiterId();
    this.otherUserId = ''; 
    this.polling = new Subscription();
  }

  ngOnInit() {
    this.loadMessages();
    // Poll for new messages every 5 seconds
    this.polling = interval(5000).subscribe(() => {
      this.loadMessages();
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.polling.unsubscribe();
  }

  loadMessages() {
    const subscription = this.chatService
      .getMessages(this.currentUserId, this.otherUserId)
      .subscribe({
        next: (messages: IMessage[]) => {
          this.messages = messages;
          this.markMessagesAsRead();
        },
        error: (error: Error) => console.error('Error loading messages:', error)
      });
    this.subscriptions.add(subscription);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: IMessage = {
      sender: this.currentUserId,
      receiver: this.otherUserId,
      content: this.newMessage.trim(),
      timestamp: new Date(),
      isRead: false
    };

    const subscription = this.chatService.sendMessage(message).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadMessages();
      },
      error: (error: Error) => console.error('Error sending message:', error)    });

    this.subscriptions.add(subscription);
  }

  markMessagesAsRead() {
    const subscription = this.chatService
      .markMessagesAsRead(this.currentUserId, this.otherUserId)
      .subscribe();
    this.subscriptions.add(subscription);
  }
}