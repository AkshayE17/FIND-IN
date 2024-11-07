import { Types } from 'mongoose';
import { ICompany } from '../../models/company';

export interface ICompanyRepository {
  create(companyData: ICompany): Promise<ICompany>;
  getById(id: string): Promise<ICompany | null>;
  update(id: string, updateData: Partial<ICompany>): Promise<ICompany | null>;
  delete(id: string): Promise<ICompany | null>;
  getAll(): Promise<ICompany[]>;
  getByHrId(hrId: Types.ObjectId): Promise<ICompany | null>;
}
