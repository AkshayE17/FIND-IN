import { Request, Response } from 'express';
import { IProfessionalDetailsService } from '../interfaces/professionalDetails/IProfessionalDetailsService';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';

export class ProfessionalDetailsController {
  constructor(private _professionalDetailsService: IProfessionalDetailsService) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering the professional details controller...");
      const userId = req.params.id;
      console.log("Type of user id is:", typeof userId);
      const details = req.body;
      console.log("User details are:", userId, details);

      const professionalDetail = await this._professionalDetailsService.create(userId, details);
      res.status(HttpStatus.CREATED).json(professionalDetail);
    } catch (error: unknown) {
      console.error("Error in creating professional detail:", error);
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const professionalDetail = await this._professionalDetailsService.getById(id);

      if (professionalDetail) {
        res.status(HttpStatus.OK).json(professionalDetail);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
      }
    } catch (error: unknown) {
      console.error("Error in fetching professional detail by ID:", error);
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const professionalDetails = await this._professionalDetailsService.getByUserId(userId);
      res.status(HttpStatus.OK).json(professionalDetails);
    } catch (error: unknown) {
      console.error("Error in fetching professional detail by user ID:", error);
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log("Id is:", id);
      const updatedDetails = await this._professionalDetailsService.update(id, req.body);
      console.log("Updated details are:", updatedDetails);
      if (updatedDetails) {
        res.status(HttpStatus.OK).json(updatedDetails);
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
      }
    } catch (error: unknown) {
      console.error("Error in updating professional detail:", error);
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const deletedDetail = await this._professionalDetailsService.delete(id);

      if (deletedDetail) {
        res.status(HttpStatus.OK).json({ message: Messages.JOB_CATEGORY_DELETED });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
      }
    } catch (error: unknown) {
      console.error("Error in deleting professional detail:", error);
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }
}
