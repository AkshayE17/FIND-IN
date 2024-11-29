import { IChatRoomRepository } from "../interfaces/chat/IChatRoomRepository";
import ChatRoomModel, { ChatRoom } from "../models/chatRoom";

class ChatRoomRepository implements IChatRoomRepository {
  async createChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom> {
    const chatRoom = new ChatRoomModel({ jobSeekerId, recruiterId });
    return chatRoom.save();
  }

  async findChatRoom(jobSeekerId: string, recruiterId: string): Promise<ChatRoom | null> {
    return ChatRoomModel.findOne({ jobSeekerId, recruiterId });
  }

// In ChatRoomRepository
async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
  return ChatRoomModel.find({
    $or: [{ jobSeekerId: userId }, { recruiterId: userId }],
  })
  .populate('jobSeekerId')
  .populate('recruiterId')
  .populate({
    path: 'messages',
    model: 'MessageModel',
    options: { 
      limit: 1, 
      sort: { createdAt: -1 } 
    }
  });
}
}

export default new ChatRoomRepository();
