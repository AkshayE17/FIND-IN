import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  hrId: Types.ObjectId;
  logo: string;
  companyName: string;
  contactNumber: string;
  companyWebsite: string;
  about: string;
  city: string;
  country: string;
}

const CompanySchema: Schema = new Schema(
  {
    hrId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Recruiter' }, // Use ObjectId and reference the Recruiter model
    logo: { type: String, required: true },
    companyName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    companyWebsite: { type: String, required: true },
    about: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
