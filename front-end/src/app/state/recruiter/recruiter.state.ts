export interface IRecruiter {
  name: string;
  email: string;
  officialEmail: string;  
  mobile: number;
  gender: string;
  companyName: string;
  companyWebsite: string;
  jobTitle: string;
  einNumber: string;
  imageUrl?: string;
  password: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  isApproved?: boolean;
  registrationDate?: Date;
}

export interface RecruiterState {
  recruiter: IRecruiter | null; 
  loading: boolean;
  error: string | null;
}

export const initialRecruiterState: RecruiterState = {
  recruiter: null,
  loading: false,
  error: null,
};
