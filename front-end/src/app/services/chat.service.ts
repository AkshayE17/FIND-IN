import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IMessage {
  _id?: string ;
  sender: string | null;
  receiver: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8888/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: IMessage): Observable<IMessage> {
    return this.http.post<IMessage>(`${this.apiUrl}/messages`, message);
  }

  getMessages(recruiterId: string | null, userId: string): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(
      `${this.apiUrl}/messages/${recruiterId}/${userId}`
    );
  }

  markMessagesAsRead(receiverId: string | null, senderId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/messages/read/${receiverId}/${senderId}`,
      {}
    );
  }
}