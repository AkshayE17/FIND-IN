import { ICompany } from '../../models/company';

export interface ICompanyService {
  createOrUpdateCompany(hrId: string, companyData: ICompany): Promise<ICompany>;
  getCompanyByHrId(hrId: string): Promise<ICompany | null>;
}
