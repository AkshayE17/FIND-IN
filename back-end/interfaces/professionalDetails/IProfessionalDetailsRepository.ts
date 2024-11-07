import { IProfessionalDetails } from "../../models/professionalDetails";

export interface IProfessionalDetailsRepository {
  create(details: IProfessionalDetails): Promise<IProfessionalDetails>;
  findById(id: string): Promise<IProfessionalDetails | null>;
  findByUserId(userId: string): Promise<IProfessionalDetails[]>;
  update(id: string, details: Partial<IProfessionalDetails>): Promise<IProfessionalDetails | null>;
  delete(id: string): Promise<IProfessionalDetails | null>;
}
