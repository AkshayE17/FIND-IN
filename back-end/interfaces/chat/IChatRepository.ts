import { IChatRoom } from "../../models/chat";
import { IMessage } from "../../models/message";


export interface IChatRepository {
  createMessage(messageData: IMessage): Promise<IMessage>;
  getMessages(recruiterId: string, userId: string): Promise<IMessage[]>;
  getChatRoom(recruiterId: string, userId: string): Promise<IChatRoom | null>;
  createChatRoom(roomData: IChatRoom): Promise<IChatRoom>;
  updateLastMessage(roomId: string, message: string): Promise<void>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;
}
