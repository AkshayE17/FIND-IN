import { ICompany, IRecruiter } from "../recruiter/recruiter.state";
import { IUser } from "../user/user.state";


export interface IManageJobs {
  jobs: Job[];
  total: number;
}



export interface IJob {
  _id?: string; 
  jobTitle: string;
  jobType: string;
  jobCategory: string;
  experienceRequired: number;
  location: string;
  salary: number;
  skills: string[]; 
  jobDescription: string;
  recruiterId?: string;
  companyId?: string ;
  applicants?: IApplicant[];
  createdAt?:Date;
  updatedAt?:Date;
}

export interface Job {
  _id: string;
  companyId?: string;
  recruiterId?: string;
  jobTitle: string;
  jobType: string;
  jobCategory: string;
  jobDescription: string;
  experienceRequired: string;
  location: string;
  salary: string;
  skills: string[];
  shortListed: string[]; 
  applicants?: IApplicant[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface IApplicant {
  _id: string;
  userId: IUser;
  appliedDate: string;
  applicationStatus: "applied" | "shortlisted" | "rejected";
}


export interface IJobResponse {
  _id?: string; 
  jobTitle: string;
  jobType: string;
  jobCategory: string;
  experienceRequired: number;
  location: string;
  salary: number;
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
    

export interface JobStatistics {
  totalJobs: number;
  totalApplicants: number;
  jobsByCategory: { category: string, count: number }[];
  applicantsBySkill: { skill: string, count: number }[];
}

export interface JobReport {
  jobTitle: string;
  companyName: string;
  totalApplicants: number;
  averageSalary: number;
  topSkills: string[];
}
