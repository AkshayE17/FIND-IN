import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '2m' }, 
});

export default mongoose.model<IOtp>('Otp', otpSchema);
