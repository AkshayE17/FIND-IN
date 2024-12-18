import { IProfessionalDetailsRepository } from "../interfaces/professionalDetails/IProfessionalDetailsRepository";
import { IProfessionalDetails, ProfessionalDetailsModel } from "../models/professionalDetails";

class ProfessionalDetailsRepository implements IProfessionalDetailsRepository {
  
  // Create a new professional detail entry
  async create(details: IProfessionalDetails): Promise<IProfessionalDetails> {
    try {
      const professionalDetail = new ProfessionalDetailsModel(details);
      return await professionalDetail.save();
    } catch (error) {
      console.error("Error creating professional details", error);
      throw new Error("Error creating professional details");
    }
  }

  // Find professional details by ID
  async findById(id: string): Promise<IProfessionalDetails | null> {
    try {
      return await ProfessionalDetailsModel.findById(id).populate('userId');
    } catch (error) {
      console.error(`Error finding professional details by ID: ${id}`, error);
      throw new Error("Error finding professional details by ID");
    }
  }

  // Find professional details by user ID
  async findByUserId(userId: string): Promise<IProfessionalDetails[]> {
    try {
      const result=await ProfessionalDetailsModel.find({ userId }).populate('userId');
      return result
    } catch (error) {
      console.error(`Error finding professional details for user ID: ${userId}`, error);
      throw new Error("Error finding professional details by user ID");
    }
  }

  // Update professional details by ID
  async update(id: string, details: Partial<IProfessionalDetails>): Promise<IProfessionalDetails | null> {
    try {

      const result= await ProfessionalDetailsModel.findOneAndUpdate({ userId: id }, details, { new: true });
      console.log("Result: ", result);
      return result;
    } catch (error) {
      console.error(`Error updating professional details for ID: ${id}`, error);
      throw new Error("Error updating professional details");
    }
  }

  // Delete professional details by ID
  async delete(id: string): Promise<IProfessionalDetails | null> {
    try {
      return await ProfessionalDetailsModel.findByIdAndDelete(id);
    } catch (error) {
      console.error(`Error deleting professional details for ID: ${id}`, error);
      throw new Error("Error deleting professional details");
    }
  }
}

export default new ProfessionalDetailsRepository();
