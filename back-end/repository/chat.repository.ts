import { IChatRepository } from "../interfaces/chat/IChatRepository";
import { ChatRoom, IChatRoom } from "../models/chat";
import { IMessage, Message } from "../models/message";
export class ChatRepository implements IChatRepository {
  async createMessage(messageData: IMessage): Promise<IMessage> {
    const message = new Message(messageData);
    return await message.save();
  }

  async getMessages(recruiterId: string, userId: string): Promise<IMessage[]> {
    return await Message.find({
      $or: [
        { sender: recruiterId, receiver: userId },
        { sender: userId, receiver: recruiterId }
      ]
    }).sort({ timestamp: 1 });
  }

  async getChatRoom(recruiterId: string, userId: string): Promise<IChatRoom | null> {
    return await ChatRoom.findOne({ recruiterId, userId });
  }

  async createChatRoom(roomData: IChatRoom): Promise<IChatRoom> {
    const room = new ChatRoom(roomData);
    return await room.save();
  }

  async updateLastMessage(roomId: string, message: string): Promise<void> {
    await ChatRoom.findByIdAndUpdate(roomId, {
      lastMessage: message,
      lastMessageTime: new Date(),
      $inc: { unreadCount: 1 }
    });
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await Message.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { isRead: true }
    );
  }
}

export default new ChatRepository();