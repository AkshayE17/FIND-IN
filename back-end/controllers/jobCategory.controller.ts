import { NextFunction, Request, Response } from 'express';
import { IJobCategoryService } from '../interfaces/jobCategory/IJobCategoryService';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';
import { upload } from '../config/multer';
import { IJobCategory } from '../models/JobCatogory';
import { IJobCategoryController } from '../interfaces/jobCategory/IJobCategoryController';
import { deleteFileFromS3, uploadFileToS3 } from '../services/s3.service';

export class JobCategoryController implements IJobCategoryController {
  constructor(private _jobCategoryService: IJobCategoryService) {}

  // Create job category
  async createJobCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
      }

      try {
        const { name, description } = req.body;
        const file = req.file;

        if (!name || !description || !file) {
          console.error("Missing required fields: name, description, or file");
          return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
        }

        const existingCategory = await this._jobCategoryService.findCategoryByName(name);
        if (existingCategory) {
          return res.status(HttpStatus.CONFLICT).json({ message: Messages.JOB_CATEGORY_EXISTS });
        }

        const category = await this._jobCategoryService.createCategory({ name, description, file });
        res.status(HttpStatus.CREATED).json({ message: Messages.JOB_CATEGORY_CREATED, category });
      } catch (error) {
        console.error('Error in creating job category:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    });
  }

  // Get all job categories with pagination and search
  async getJobCategories(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const searchTerm = (req.query.search as string) || '';

      const { categories, total } = await this._jobCategoryService.getCategories(page, limit, searchTerm);
      res.status(HttpStatus.OK).json({ categories, total });
    } catch (error) {
      console.error('Error in retrieving job categories:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  // Get all job categories without pagination
  async getAllJobCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this._jobCategoryService.getAllJobCategories();
      res.status(HttpStatus.OK).json(categories);
    } catch (error) {
      console.error('Error in retrieving all job categories:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  // Update an existing job category
  async updateJobCategory(req: Request, res: Response): Promise<void> {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
      }

      try {
        const id = req.params.id;
        const { name, description, imageUrl } = req.body;
        const file = req.file;

        if (!name || !description || (!file && !imageUrl)) {
          console.error("Missing required fields: name, description, or image");
          return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
        }

        const updateData: Partial<IJobCategory> = { name, description };

        if (file) {
          console.log("New file uploaded. Updating S3...");
          if (imageUrl) {
            const oldImageKey = imageUrl.split('/').pop();
            if (oldImageKey) await deleteFileFromS3(oldImageKey);
          }
          updateData.imageUrl = await uploadFileToS3(file);
        } else if (imageUrl) {
          updateData.imageUrl = imageUrl;
        }

        const updatedCategory = await this._jobCategoryService.updateCategory(id, updateData);

        if (!updatedCategory) {
          console.error("Category not found:", id);
          return res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_CATEGORY_NOT_FOUND });
        }

        res.status(HttpStatus.OK).json({ message: Messages.JOB_CATEGORY_UPDATED, category: updatedCategory });
      } catch (error) {
        console.error("Error in updating job category:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    });
  }

  // Delete a job category
  async deleteJobCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const success = await this._jobCategoryService.deleteCategory(name);
      if (success) {
        res.status(HttpStatus.OK).json({ message: Messages.JOB_CATEGORY_DELETED });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_CATEGORY_NOT_FOUND });
      }
    } catch (error) {
      console.error('Error in deleting job category:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
}
