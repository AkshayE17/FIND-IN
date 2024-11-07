import { IProfessionalDetails } from "../../models/professionalDetails";

export interface IProfessionalDetailsService {
  create(userId: string, details: Omit<IProfessionalDetails, 'userId'>): Promise<IProfessionalDetails>;
  getById(id: string): Promise<IProfessionalDetails | null>;
  getByUserId(userId: string): Promise<IProfessionalDetails[]>;
  update(id: string, details: Partial<IProfessionalDetails>): Promise<IProfessionalDetails | null>;
  delete(id: string): Promise<IProfessionalDetails | null>;
}
