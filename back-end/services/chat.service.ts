import { IChatRepository } from "../interfaces/chat/IChatRepository";
import { IChatService } from "../interfaces/chat/IChatService";
import { IMessage } from "../models/message";


export class ChatService implements IChatService {
 

  constructor( private _chatRepository: IChatRepository) {}

  async sendMessage(messageData: IMessage): Promise<IMessage> {
    const message = await this._chatRepository.createMessage(messageData);

    let chatRoom = await this._chatRepository.getChatRoom(
      messageData.sender,
      messageData.receiver
    );

    if (!chatRoom) {
      chatRoom = await this._chatRepository.createChatRoom({
        recruiterId: messageData.sender,
        userId: messageData.receiver,
      });
    }

    await this._chatRepository.updateLastMessage(chatRoom._id!, messageData.content);
    return message;
  }

  async getMessages(recruiterId: string, userId: string): Promise<IMessage[]> {
    return await this._chatRepository.getMessages(recruiterId, userId);
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await this._chatRepository.markMessagesAsRead(receiverId, senderId);
  }
}
