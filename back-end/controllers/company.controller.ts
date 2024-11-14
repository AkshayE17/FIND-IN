import { Request, Response } from 'express';
import { ICompanyController } from '../interfaces/company/ICompanyController';
import { ICompanyService } from '../interfaces/company/ICompanyService';
import { HttpStatus } from '../constants/http.constants';
import { Messages } from '../constants/message.constants';

// Implement the CompanyController class her

export class CompanyController implements ICompanyController {
  constructor(private _companyService: ICompanyService) {}

  async createOrUpdateCompany(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.params.recruiterId;
      const companyData = req.body;

      console.log("recruiter id:", recruiterId);

      const result = await this._companyService.createOrUpdateCompany(recruiterId, companyData);
      if (result) {   
        res.cookie('companyId', result.id.toString(), { httpOnly: true, path: '/' });
        res.status(result._id ? HttpStatus.OK : HttpStatus.CREATED).json(result);
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
      }
    } catch (error: any) {  
      console.error('Error in createOrUpdateCompany:', error);  
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async getCompanyByHrId(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering get company by hr id");
      const hrId = req.params.recruiterId;
      const company = await this._companyService.getCompanyByHrId(hrId);

      if (company) {
        res.status(HttpStatus.OK).json(company);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.COMPANY_NOT_FOUND });
      }
    } catch (error: any) {
      console.error('Error in getCompanyByHrId:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
}
