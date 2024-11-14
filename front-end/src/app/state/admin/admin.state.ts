

export interface IAdmin {
  username: string;
  password: string;
}

export interface LoginResponse {
  admin: IAdmin;
  accessToken: string;
  refreshToken: string;
}



export interface AdminState {
  admin: IAdmin | null;
  accessToken: string | null;
  role: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  admin: null,
  accessToken: null,
  role: null,
  loading: false,
  error: null,
};
