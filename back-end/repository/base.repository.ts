import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IBaseRepository } from '../interfaces/baseRepo/IBaseRepository';


export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      const entity = new this.model(data);
      return await entity.save();
    } catch (error: unknown) {
      throw new Error(`Error creating entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error: unknown) {
      throw new Error(`Error finding entity by id: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error: unknown) {
      throw new Error(`Error finding entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    try {
      return await this.model.find(filter, null, options).exec();
    } catch (error: unknown) {
      throw new Error(`Error finding entities: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findWithPagination(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<{ data: T[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.model
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
        this.model.countDocuments(filter)
      ]);
      
      return { data, total };
    } catch (error: unknown) {
      throw new Error(`Error finding entities with pagination: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    try {
      const entity = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
      return entity;
    } catch (error: unknown) {
      throw new Error(`Error updating entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error: unknown) {
      throw new Error(`Error deleting entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.model.find().exec();
    } catch (error: unknown) {
      throw new Error(`Error finding all entities: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error: unknown) {
      throw new Error(`Error counting documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}