  import { IAdmin } from '../../models/admin';
  import { IRecruiter } from '../../models/Recruiter';
  import { IUser } from '../../models/User';
  import { FilterOptions } from '../../models/Recruiter';

  export interface IAdminService {
    login(email: string, password: string): Promise<{ admin: IAdmin, accessToken: string, refreshToken: string }>;
    createAdmin(email: string, password: string): Promise<IAdmin>;
    getPendingRecruiters(page: number, limit: number, search: string, filters: FilterOptions): Promise<{ recruiters: IRecruiter[], total: number }>;
    getRecruiters(page:number,limit:number,search:string,filters:FilterOptions): Promise<{recruiters:IRecruiter[],total:number}>;
    getUsers(page:number,limit:number,search:string,filters:FilterOptions): Promise<{users:IUser[],total:number}>;
    approveRecruiter(email: string): Promise<IRecruiter | null>;
    rejectRecruiter(email: string): Promise<IRecruiter | null>;
    blockOrUnblockRecruiter(email: string): Promise<IRecruiter | null>;
    blockOrUnblockUser(email: string): Promise<IUser | null>;
  }