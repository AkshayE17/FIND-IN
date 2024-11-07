import { IJobCategory } from "../../models/JobCatogory";

export interface IJobCategoryRepository {
  create(categoryData: Partial<IJobCategory>): Promise<IJobCategory>;
  getById(id: string): Promise<IJobCategory | null>;
  update(id: string, categoryData: Partial<IJobCategory>): Promise<IJobCategory | null>;
  delete(id: string): Promise<boolean>;
  getJobCategories(page: number, limit: number, searchTerm: string): Promise<{ categories: IJobCategory[]; total: number }>; 
  getAllJobCategories():Promise<IJobCategory[]>
  findCategoryById(id: string): Promise<IJobCategory | null> 
  findCategoryByName(name: string): Promise<IJobCategory | null> 
}
