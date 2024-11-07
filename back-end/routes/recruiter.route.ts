import { Router } from "express";
import { RecruiterController } from "../controllers/recruiter.controller";
import { CompanyController } from "../controllers/company.controller";
import { JobController } from "../controllers/job.controller";
import { RecruiterService } from "../services/recruiter.service";
import { CompanyService } from "../services/company.service";
import { JobService } from "../services/job.service";
import recruiterRepository from "../repository/recruiter.repository";
import jobRepository from "../repository/job.repository";
import companyRepository from "../repository/company.repository";
import { OtpService } from "../services/otp.service";
import otpRepository from "../repository/otp.repository";
import { JobCategoryController } from "../controllers/jobCategory.controller";
import { JobCategoryService } from "../services/jobcategory.service";
import jobCategoryRepository from "../repository/jobCategory.repository";
import userRepository from "../repository/user.repository";



const recruiterService = new RecruiterService(recruiterRepository);
const otpService= new OtpService(otpRepository)
const companyService = new CompanyService(companyRepository);
const jobService = new JobService(jobRepository,companyRepository,userRepository);
const jobCategoryService = new JobCategoryService(jobCategoryRepository)
const recruiterController = new RecruiterController(recruiterService,otpService);
const companyController = new CompanyController(companyService);
const jobController = new JobController(jobService);
const jobCategoryController= new JobCategoryController(jobCategoryService)

const recruiterRoute = Router();


recruiterRoute.post('/register', recruiterController.register.bind(recruiterController));
recruiterRoute.post('/login', recruiterController.login.bind(recruiterController));
recruiterRoute.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
recruiterRoute.post('/company-details/:recruiterId', companyController.createOrUpdateCompany.bind(companyController));
recruiterRoute.get('/company-details/:recruiterId', companyController.getCompanyByHrId.bind(companyController));
recruiterRoute.post('/post-job', jobController.createJob.bind(jobController));
recruiterRoute.get('/jobs', jobController.getRecruiterJob.bind(jobController));
recruiterRoute.delete('/job/:id', jobController.deleteJob.bind(jobController));
recruiterRoute.put('/job/:id', jobController.updateJob.bind(jobController));
recruiterRoute.get('/jobCategories',jobCategoryController.getAllJobCategories.bind(jobCategoryController));
recruiterRoute.get('/jobs/applicants', jobController.getJobsWithApplicants.bind(jobController));

export default recruiterRoute;
