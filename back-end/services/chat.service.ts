import { IChatRoomRepository } from "../interfaces/chat/IChatRoomRepository";
import { IChatService } from "../interfaces/chat/IChatService";
import { IMessageRepository } from "../interfaces/chat/IMessageRepository";
import { ChatRoom } from "../models/chatRoom";
import { Message } from "../models/message";

export class ChatService implements IChatService {
  constructor(
    private chatRoomRepository: IChatRoomRepository,
    private messageRepository: IMessageRepository
  ) {}

  async createChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom> {
    const existingChatRoom = await this.chatRoomRepository.findChatRoom(jobSeekerId, recruiterId);
    if (existingChatRoom) return existingChatRoom;
    return this.chatRoomRepository.createChatRoom(jobSeekerId, recruiterId);
  }

  async sendMessage(chatRoomId: string, senderId: string, text: string,type:string): Promise<Message> {
    return this.messageRepository.saveMessage(chatRoomId, senderId, text,type);
  }

  async getChatRoomMessages(chatRoomId: string): Promise<Message[]> {
    return this.messageRepository.getMessagesByChatRoom(chatRoomId);
  }

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomRepository.getUserChatRooms(userId);
  }

  async markMessageSeen(messageId: string): Promise<Message | null> {
    return this.messageRepository.markMessageAsSeen(messageId);
  }
}
