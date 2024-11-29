import { IJobCategory, JobCategory } from "../models/JobCatogory";
import { IJobCategoryRepository } from "../interfaces/jobCategory/IJobCategoryRepository";

export class JobCategoryRepository implements IJobCategoryRepository {
  async create(categoryData: Partial<IJobCategory>): Promise<IJobCategory> {
    const category = new JobCategory(categoryData);
    return category.save();
  }

  async getJobCategories(page: number, limit: number, searchTerm: string): Promise<{ categories: IJobCategory[], total: number }> {
    const filter = searchTerm ? { name: { $regex: searchTerm, $options: 'i' } } : {};
  
    const categories = await JobCategory.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);
  
    const total = await JobCategory.countDocuments(filter);
  
    return { categories, total };
  }

  async getAllJobCategories(): Promise<IJobCategory[]> {
    const jobCategories=await JobCategory.find();
    return jobCategories;
  }
    

  async getById(id: string): Promise<IJobCategory | null> {
    return JobCategory.findById(id);
  }

  async update(id: string, categoryData: Partial<IJobCategory>): Promise<IJobCategory | null> {

    return JobCategory.findByIdAndUpdate(
      { _id: id }, 
      categoryData, 
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    console.log("id :",id)
    const result=JobCategory.findByIdAndDelete(id);
    console.log("delete result",result);
    const a= JobCategory.deleteOne({ _id: id }).exec();
    return true;
  }
  
//find by name// Inside your _jobCategoryService
async findCategoryByName(name: string): Promise<IJobCategory | null> {
  return await JobCategory.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
}

  
//find by id
async findCategoryById(id: string): Promise<IJobCategory | null> {
  return JobCategory.findOne({ _id:id }).exec();
}
}
   

export default new JobCategoryRepository();
