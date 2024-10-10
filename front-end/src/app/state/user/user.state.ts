
export interface IUser {
  name: string;
  email: string;
  mobile: number;
  gender: string;
  imageUrl?: string;
}

export interface UserState {
  user: IUser | null; 
  loading: boolean;
  error: string | null;
  justLoggedIn: boolean;  // New flag to track login status
}

export const initialUserState: UserState = {
  user: null,
  loading: false,
  error: null,
  justLoggedIn: false,  // Initialize as false
};
