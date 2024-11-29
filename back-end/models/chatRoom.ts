import { Schema, model, Document } from 'mongoose';

export interface ChatRoom extends Document {
  jobSeekerId: string;
  recruiterId: string;
  messages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema(
  {
    jobSeekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Indexing for performance
ChatRoomSchema.index({ jobSeekerId: 1 });
ChatRoomSchema.index({ recruiterId: 1 });

export default model<ChatRoom>('ChatRoomModel', ChatRoomSchema);
