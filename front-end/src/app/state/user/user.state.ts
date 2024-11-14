export interface UserState {
  user: IUser | null;
  accessToken: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  professionalDetails: IProfessionalDetails | null;
}

export const initialUserState: UserState = {
  user: null,
  accessToken: null,
  role: null,
  loading: false,
  error: null,
  professionalDetails: null,
};

export interface IUser {
  id:string;
  name: string;
  email: string;
  mobile: number;
  gender: string;
  imageUrl?: string;
  password?:string;
  isBlocked:boolean;
  isVerified:string;
  jobs?: string[];
  professionalDetails?: IProfessionalDetails | null;
  createdAt:Date;
  updatedAt:Date;
}

export interface IProfessionalDetails {
  _id: string;
  userId: string;
  title: string;
  skills: string[];
  experience: number;
  currentLocation: string;
  expectedSalary: number;
  about: string;
  resumeUrl?:string;
}



export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

