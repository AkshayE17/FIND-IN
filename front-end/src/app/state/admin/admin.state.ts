

export interface IAdmin {
  username: string;
  password: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  admin: IAdmin;
  accessToken: string;
  refreshToken: string;
}



export interface AdminState {
  admin: IAdmin | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  admin: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};
