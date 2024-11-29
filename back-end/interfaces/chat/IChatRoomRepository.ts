import { ChatRoom } from "../../models/chatRoom";

export interface IChatRoomRepository {
  createChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom>;
  findChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom | null>;
  getUserChatRooms(userId: string): Promise<ChatRoom[]>;
}
