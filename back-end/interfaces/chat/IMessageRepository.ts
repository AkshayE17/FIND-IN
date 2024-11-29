import { Message } from "../../models/message";

export interface IMessageRepository {
  saveMessage(chatRoomId: string, senderId: string, text: string,type:string
  ): Promise<Message>;
  getMessagesByChatRoom(chatRoomId: string): Promise<Message[]>;
  markMessageAsSeen(messageId: string): Promise<Message | null>;
  getUnseenMessageCountForChatRoom(chatRoomId: string, userId: string): Promise<number>
}
