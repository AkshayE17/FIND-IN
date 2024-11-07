import mongoose, { Document, Schema } from 'mongoose';

export interface IProfessionalDetails extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User model
  title: string;
  skills: string[];
  experience: number;
  currentLocation: string;
  expectedSalary: number;
  about: string;
  resumeUrl?: string;
}

const ProfessionalDetailsSchema = new Schema<IProfessionalDetails>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  title: { type: String, required: true },
  skills: { type: [String], required: true },
  experience: { type: Number, required: true },
  currentLocation: { type: String, required: true },
  expectedSalary: { type: Number, required: true },
  about: { type: String, required: true },
  resumeUrl: { type: String },
});

export const ProfessionalDetailsModel = mongoose.model<IProfessionalDetails>('ProfessionalDetails', ProfessionalDetailsSchema);
