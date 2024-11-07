import { IJobCategory } from "../../models/JobCatogory";

export interface IJobCategoryService {
  createCategory(data: { name: string; description: string; file?: Express.Multer.File }): Promise<IJobCategory>;
  getCategories(page: number, limit: number, searchTerm: string): Promise<{ categories: IJobCategory[]; total: number }>; 
  getAllJobCategories():Promise<IJobCategory[]>
  updateCategory(id: string, data: { name?: string; description?: string; file?: Express.Multer.File }): Promise<IJobCategory | null>;
  deleteCategory(name: string): Promise<boolean>;
 findCategoryByName(name: string): Promise<IJobCategory | null>
}
   