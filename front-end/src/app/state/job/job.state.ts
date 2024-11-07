import { ICompany, IRecruiter } from "../recruiter/recruiter.state";

export interface IJob {
  _id?: string | null | undefined; 
  jobTitle: string;
  jobType: string;
  jobCategory: string;
  experienceRequired: string;
  location: string;
  salary: string;
  skills: string[]; 
  jobDescription: string;
  recruiterId?: string;
  companyId?: string ;
  applicants?: string[];
  createdAt?:Date;
  updatedAt?:Date;
}

export interface IJobResponse {
  _id?: string; 
  jobTitle: string;
  jobType: string;
  jobCategory: string;
  experienceRequired: string;
  location: string;
  salary: string;
  skills: string[]; 
  jobDescription: string;
  recruiterId?: IRecruiter;
  companyId?:ICompany;
  applicants?: string[];
  createdAt?:Date;
  updatedAt?:Date;
}

export interface IJobCategory {
  _id?: string | null | undefined;
  name: string; 
  description: string;
  imageUrl?: string;
}

export interface JobState {
  jobs: IJob[]; 
  total: number;  
}


