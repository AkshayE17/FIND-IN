import { IMessageRepository } from "../interfaces/chat/IMessageRepository";
import MessageModel, { Message } from "../models/message";

class MessageRepository implements IMessageRepository {
  async saveMessage(chatRoomId: string, senderId: string, text: string,type:string): Promise<Message> {
    const message = new MessageModel({ chatRoomId, senderId,senderType:type, text, seen: false });
    return message.save();
  }

  async getMessagesByChatRoom(chatRoomId: string): Promise<Message[]> {
    return MessageModel.find({ chatRoomId }).sort({ createdAt: 1 }); // Sort by creation time
  }

  async markMessageAsSeen(messageId: string): Promise<Message | null> {
    return MessageModel.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true } // Return up
    );
  }

  async getUnseenMessageCountForChatRoom(chatRoomId: string, userId: string): Promise<number> {
    return MessageModel.countDocuments({ 
      chatRoomId, 
      seen: false, 
      senderId: { $ne: userId } 
    });
  }
}

export default new MessageRepository();
