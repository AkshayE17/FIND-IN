
export interface IAdmin {
  username: string;
  password: string;
  isAdmin?: boolean;
}

export interface AdminState {
  admin: IAdmin | null;
  loading: boolean;
  error: string | null;
}

export const initialAdminState: AdminState = {
  admin: null,
  loading: false,
  error: null,
};
