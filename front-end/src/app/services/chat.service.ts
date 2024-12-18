import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message, ChatRoom } from '../state/recruiter/recruiter.state';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.backendUrl;
  private socket: Socket;

  constructor(private http:HttpClient) {
    this.socket = io(environment.backendUrl, {
      transports: ['websocket', 'polling'],
    });
  }

  joinRoom(chatRoomId: string): void {
    this.socket.emit('joinRoom', { chatRoomId });
  }

  sendMessage(chatRoomId: string, senderId: string |null, text: string,type:string): void {
    this.socket.emit('newMessage', { chatRoomId, senderId, text ,type});
  }

  onMessageReceived(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messageReceived', (message) => {
        observer.next(message);
      });
    });
  }

  emitTyping(chatRoomId: string, senderId: string | null): void {
    this.socket.emit('typing', { chatRoomId, senderId });
  }

  onTyping(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userTyping', (data) => {
        observer.next(data);
      });
    });
  }

  markMessageAsSeen(messageId: string): void {
    this.socket.emit('markAsSeen', { messageId });
  }

  onMessageSeen(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messageSeen', (message) => {
        observer.next(message);
      });
    });
  }

  createChatRoom(data: { recruiterId: string | null; jobSeekerId: string;}) {
    console.log("data in create room",data);
    return this.http.post(`${this.apiUrl}/chat/create-room`, data); 
  }

  // Additional methods for chat service
getUserChatRooms(userId: string | null): Observable<ChatRoom[]> {
  return this.http.get<ChatRoom[]>(`${this.apiUrl}/chat/user-rooms/${userId}`);
}

getChatRoomMessages(chatRoomId: string): Observable<Message[]> {
  return this.http.get<Message[]>(`${this.apiUrl}/chat/messages/${chatRoomId}`);
}

getUnseenMessageCount(chatRoomId: string, userId: string): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/chat/${chatRoomId}/unseen-count/${userId}`);
}

onUserStatusChanged(): Observable<any> {
  // Implementation depends on your socket setup
  return new Observable((observer) => {
    // your implementation here
  });
}
// Emit user online status when component initializes
notifyUserOnline(userId: string) {
  this.socket.emit('userOnline', userId);
}

}


