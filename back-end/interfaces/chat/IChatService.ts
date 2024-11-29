import { ChatRoom } from "../../models/chatRoom";
import { Message } from "../../models/message";

export interface IChatService {
  createChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom>;
  sendMessage(chatRoomId: string, senderId: string, text: string,type:string): Promise<Message>;
  getChatRoomMessages(chatRoomId: string): Promise<Message[]>;
  markMessageSeen(messageId: string): Promise<Message | null>;
  getUserChatRooms(userId: string): Promise<ChatRoom[]>
}
