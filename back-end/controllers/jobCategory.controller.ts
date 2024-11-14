import { NextFunction, Request, Response } from 'express';
import { IJobCategoryService } from '../interfaces/jobCategory/IJobCategoryService';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';
import { IJobCategory } from '../models/JobCatogory';
import { IJobCategoryController } from '../interfaces/jobCategory/IJobCategoryController';
import { Types } from 'mongoose';


export class JobCategoryController implements IJobCategoryController {
  constructor(private _jobCategoryService: IJobCategoryService) {}

  // Create job category
  async createJobCategory(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
    try {
      const { name, description, imageUrl } = req.body;
 
      // Validate required fields
      if (!name || !description || !imageUrl) {
        console.error("Missing required fields: name, description, or imageUrl");
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
      }
 
      // Check if category already exists
      const existingCategory = await this._jobCategoryService.findCategoryByName(name);
      if (existingCategory) {
        return res.status(HttpStatus.CONFLICT).json({ message: Messages.JOB_CATEGORY_EXISTS });
      }
 
      // Create new category
      const category = await this._jobCategoryService.createCategory({ name, description, imageUrl });
      res.status(HttpStatus.CREATED).json({ message: Messages.JOB_CATEGORY_CREATED, category });
    } catch (error) {
      console.error('Error in creating job category:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
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
  async updateJobCategory(req: Request, res: Response): Promise<Response | undefined> {
    try {
      const id = req.params.id;
      const { name, description, imageUrl } = req.body;
  
      // Check for missing required fields
      if (!name || !description) {
        console.error("Missing required fields: name or description");
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.INVALID_DATA_PROVIDED });
      }
  
      // Check if another category with the same name exists, but exclude the current category (id)
      const existingCategory = await this._jobCategoryService.findCategoryByName(name);
      console.log("existing category:", existingCategory);
      console.log("id:", id);
      if (existingCategory && existingCategory.id.toString() !== id) {
        return res.status(HttpStatus.CONFLICT).json({ message: Messages.JOB_CATEGORY_EXISTS });
      }
  
      const updateData: Partial<IJobCategory> = { name, description };
  
      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }
  
      // Update the category in the database
      const updatedCategory = await this._jobCategoryService.updateCategory(id, updateData);
  
      if (!updatedCategory) {
        console.error("Category not found:", id);
        return res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_CATEGORY_NOT_FOUND });
      }
  
      // Return success response
      res.status(HttpStatus.OK).json({ message: Messages.JOB_CATEGORY_UPDATED, category: updatedCategory });
    } catch (error) {
      console.error("Error in updating job category:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
  
  
  // Delete a job category
  async deleteJobCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this._jobCategoryService.deleteCategory(id);
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
