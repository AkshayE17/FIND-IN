import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}


const messageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});


export const Message = mongoose.model<IMessage>('Message', messageSchema);