
export interface IUser {
  id:string;
  name: string;
  email: string;
  mobile: number;
  gender: string;
  imageUrl?: string;
  isBlocked:boolean;
  isVerified:string;
  createdAt:Date;
  updatedAt:Date;
}

export interface IProfessionalDetails {
  title: string;
  skills: string[];
  experience: number;
  currentLocation: string;
  expectedSalary: number;
  about: string;
  resumeUrl?: string;
  resumeName?: string;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface UserState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  professionalDetails: IProfessionalDetails | null;
}

export const initialUserState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  professionalDetails: null,
};
