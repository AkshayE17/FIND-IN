import { Types } from 'mongoose';
import Company, { ICompany } from '../models/company';
import { ICompanyRepository } from '../interfaces/company/ICompanyRepository';

class CompanyRepository implements ICompanyRepository {
  async create(companyData: ICompany): Promise<ICompany> {
    try {
      const company = new Company(companyData);
      return await company.save();
    } catch (error: unknown) {
      throw new Error(`Error while creating the company: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getById(id: string): Promise<ICompany | null> {
    try {
      return await Company.findById(id).exec();
    } catch (error: unknown) {
      throw new Error(`Error while retrieving the company: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async update(id: string, updateData: Partial<ICompany>): Promise<ICompany | null> {
    try {
      return await Company.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error: unknown) {
      throw new Error(`Error while updating the company: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async delete(id: string): Promise<ICompany | null> {
    try {
      return await Company.findByIdAndDelete(id).exec();
    } catch (error: unknown) {
      throw new Error(`Error while deleting the company: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAll(): Promise<ICompany[]> {
    try {
      return await Company.find().exec();
    } catch (error: unknown) {
      throw new Error(`Error while retrieving companies: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getByHrId(hrId: Types.ObjectId): Promise<ICompany | null> {
    try {
      return await Company.findOne({ hrId }).exec();
    } catch (error: unknown) {
      throw new Error(`Error while retrieving the company by hrId: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new CompanyRepository();
