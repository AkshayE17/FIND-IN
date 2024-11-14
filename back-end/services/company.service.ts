import { Types } from 'mongoose';
import { ICompany } from '../models/company';
import { ICompanyService } from '../interfaces/company/ICompanyService';
import { ICompanyRepository } from '../interfaces/company/ICompanyRepository';
import { Messages } from '../constants/message.constants';

export class CompanyService implements ICompanyService {

  constructor(private _companyRepository: ICompanyRepository) {}

  // Create or update company
  async createOrUpdateCompany(hrId: string, companyData: ICompany): Promise<ICompany> {
    try {
      const hrObjectId = new Types.ObjectId(hrId);
      const existingCompany = await this._companyRepository.getByHrId(hrObjectId);

      if (existingCompany) {
        const updatedCompany = await this._companyRepository.update(existingCompany.id, companyData);
        if (!updatedCompany) {
          console.error(Messages.UNKNOWN_ERROR); 
          throw new Error(Messages.UNKNOWN_ERROR);
        }  
        console.log(Messages.COMPANY_UPDATED);  
        return updatedCompany;
      } else {
        companyData.hrId = hrObjectId;
        const newCompany = await this._companyRepository.create(companyData);
        console.log(Messages.COMPANY_CREATED);  
        return newCompany;
      }
    } catch (error) {
      console.error(`Error in createOrUpdateCompany: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get company by HR ID
  async getCompanyByHrId(hrId: string): Promise<ICompany | null> {
    try {
      const hrObjectId = new Types.ObjectId(hrId);
      const company = await this._companyRepository.getByHrId(hrObjectId);
      
      if (!company) {
        console.error(Messages.COMPANY_NOT_FOUND_HR_ID); 
        throw new Error(Messages.COMPANY_NOT_FOUND_HR_ID);
      }

      return company;
    } catch (error) {
      console.error(`Error in getCompanyByHrId: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
