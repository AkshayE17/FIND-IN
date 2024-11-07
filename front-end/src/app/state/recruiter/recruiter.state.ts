export interface IRecruiter {
  _id: string;
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
  createdAt:Date;
  updatedAt:Date;
}

export interface ICompany{
  _id:string;
  hrId: string; 
  logo: string; 
  companyName: string;
  contactNumber: string; 
  companyWebsite: string; 
  about: string; 
  city: string;
  country: string; 
}

export interface LoginResponse {
  recruiter: IRecruiter;
  accessToken: string;
  refreshToken: string;
  companyDetails:ICompany
}


export interface RecruiterState {  
  recruiter: IRecruiter | null; 
  companyDetails: ICompany | null; 
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialRecruiterState: RecruiterState = {
  recruiter: null,
  companyDetails: null, 
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};
