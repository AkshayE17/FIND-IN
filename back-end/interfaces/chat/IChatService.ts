import { IMessage } from "../../models/message";


export interface IChatService {
  sendMessage(messageData: IMessage): Promise<IMessage>;
  getMessages(recruiterId: string, userId: string): Promise<IMessage[]>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;
}
