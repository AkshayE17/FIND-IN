
import { Schema, model, Document } from "mongoose";

export interface IJobCategory extends Document {
  name: string;
  description: string;
  imageUrl?: string;
}

const jobCategorySchema = new Schema<IJobCategory>({
  name: { type: String, required: true, unique: true,collation: { locale: 'en', strength: 2 }  },
  description: { type: String, required: true },
  imageUrl: { type: String },
});

export const JobCategory = model<IJobCategory>("JobCategory", jobCategorySchema);
