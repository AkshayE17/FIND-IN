import { IJobCategory, JobCategory } from "../models/JobCatogory";
import { IJobCategoryRepository } from "../interfaces/jobCategory/IJobCategoryRepository";

export class JobCategoryRepository implements IJobCategoryRepository {
  // Create a new job category
  async create(categoryData: Partial<IJobCategory>): Promise<IJobCategory> {
    try {
      const category = new JobCategory(categoryData);
      return await category.save();
    } catch (error) {
      console.error("Error creating job category:", error);
      throw new Error("Error creating job category");
    }
  }

  // Get job categories with pagination and optional search term
  async getJobCategories(
    page: number, 
    limit: number, 
    searchTerm: string
  ): Promise<{ categories: IJobCategory[], total: number }> {
    try {
      const filter = searchTerm ? { name: { $regex: searchTerm, $options: 'i' } } : {};
      
      const categories = await JobCategory.find(filter)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await JobCategory.countDocuments(filter);
      
      return { categories, total };
    } catch (error) {
      console.error("Error retrieving job categories:", error);
      throw new Error("Error retrieving job categories");
    }
  }

  // Get all job categories (no pagination)
  async getAllJobCategories(): Promise<IJobCategory[]> {
    try {
      return await JobCategory.find();
    } catch (error) {
      console.error("Error retrieving all job categories:", error);
      throw new Error("Error retrieving all job categories");
    }
  }

  // Get a job category by its ID
  async getById(id: string): Promise<IJobCategory | null> {
    try {
      return await JobCategory.findById(id);
    } catch (error) {
      console.error(`Error retrieving job category with ID ${id}:`, error);
      throw new Error("Error retrieving job category by ID");
    }
  }

  // Update an existing job category by its ID
  async update(id: string, categoryData: Partial<IJobCategory>): Promise<IJobCategory | null> {
    try {
      return await JobCategory.findByIdAndUpdate(
        { _id: id }, 
        categoryData, 
        { new: true }
      ).exec();
    } catch (error) {
      console.error(`Error updating job category with ID ${id}:`, error);
      throw new Error("Error updating job category");
    }
  }

  // Delete a job category by name
  async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting job category with ID: ${id}`);
      
      const result = await JobCategory.deleteOne({ _id: id });
      
      console.log(`Delete operation result:`, result);
      return result.deletedCount === 1;
    } catch (error) {
      console.error(`Error deleting job category with ID ${id}:`, error);
      throw new Error("Error deleting job category");
    }
  }
  
  // Find job category by name
  async findCategoryByName(name: string): Promise<IJobCategory | null> {
    try {
      return await JobCategory.findOne({ name }).exec();
    } catch (error) {
      console.error(`Error finding job category with name ${name}:`, error);
      throw new Error("Error finding job category by name");
    }
  }

  // Find job category by ID
  async findCategoryById(id: string): Promise<IJobCategory | null> {
    try {
      return await JobCategory.findOne({ _id: id }).exec();
    } catch (error) {
      console.error(`Error finding job category with ID ${id}:`, error);
      throw new Error("Error finding job category by ID");
    }
  }
}

export default new JobCategoryRepository();
