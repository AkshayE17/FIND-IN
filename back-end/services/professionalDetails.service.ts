import { IProfessionalDetailsService } from '../interfaces/professionalDetails/IProfessionalDetailsService';
import { IProfessionalDetails } from '../models/professionalDetails';
import { IProfessionalDetailsRepository } from '../interfaces/professionalDetails/IProfessionalDetailsRepository';
import { Types } from 'mongoose';

export class ProfessionalDetailsService implements IProfessionalDetailsService {
  constructor(private _professionalDetailsRepository: IProfessionalDetailsRepository) {}

  async create(userId: string, details: Omit<IProfessionalDetails, 'userId'>): Promise<IProfessionalDetails> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      return await this._professionalDetailsRepository.create({ ...details, userId: userObjectId });
    } catch (error) {
      throw new Error(`Failed to create professional details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getById(id: string): Promise<IProfessionalDetails | null> {
    try {
      return await this._professionalDetailsRepository.findById(id);
    } catch (error) {
      throw new Error(`Failed to get professional details by ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getByUserId(userId: string): Promise<IProfessionalDetails[]> {
    try {
      return await this._professionalDetailsRepository.findByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get professional details by user ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async update(id: string, details: Partial<IProfessionalDetails>): Promise<IProfessionalDetails | null> {
    try {
      console.log("updating professional details...",details);
      return await this._professionalDetailsRepository.update(id, details);
    } catch (error) {
      throw new Error(`Failed to update professional details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async delete(id: string): Promise<IProfessionalDetails | null> {
    try {
      return await this._professionalDetailsRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete professional details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
