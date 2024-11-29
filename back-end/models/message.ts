import { Schema, model, Document, Types } from 'mongoose';

export interface Message extends Document {
  chatRoomId: Types.ObjectId; 
  senderId: Types.ObjectId;
  senderType: 'User' | 'Recruiter'; 
  text: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<Message>(
  {
    chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ['User', 'Recruiter'], required: true }, 
    text: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true, 
  }
);

// Indexing for performance
MessageSchema.index({ chatRoomId: 1 });
MessageSchema.index({ senderId: 1 });

export default model<Message>('MessageModel', MessageSchema);
