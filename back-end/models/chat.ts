import mongoose, { Schema } from 'mongoose';


export interface IChatRoom {
  _id?: string;
  recruiterId: string;
  userId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}



const chatRoomSchema = new Schema<IChatRoom>({
  recruiterId: { type: String, required: true },
  userId: { type: String, required: true },
  lastMessage: { type: String },
  lastMessageTime: { type: Date },
  unreadCount: { type: Number, default: 0 }
});

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);