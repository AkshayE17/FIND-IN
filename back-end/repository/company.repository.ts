import { Types } from 'mongoose';
import Company, { ICompany } from '../models/company';
import { ICompanyRepository } from '../interfaces/company/ICompanyRepository';
import { BaseRepository } from './base.repository';

class CompanyRepository extends BaseRepository<ICompany> implements ICompanyRepository {
  constructor() {
    super(Company); // Pass Company model to the base class
  }

  async getById(id: string): Promise<ICompany | null> {
    return super.findById(id);
  }

  async getAll(): Promise<ICompany[]> {
    return super.find({});
  }

  async getByHrId(hrId: Types.ObjectId): Promise<ICompany | null> {
    try {
      return await this.model.findOne({ hrId }).exec();
    } catch (error: unknown) {
      throw new Error(`Error while retrieving company by hrId: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new CompanyRepository();
