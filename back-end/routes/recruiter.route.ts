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
import { authenticateToken } from "../middlewares/authmiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";



const recruiterService = new RecruiterService(recruiterRepository);
const otpService= new OtpService(otpRepository)
const companyService = new CompanyService(companyRepository);
const jobService = new JobService(jobRepository,companyRepository);
const jobCategoryService = new JobCategoryService(jobCategoryRepository)
const recruiterController = new RecruiterController(recruiterService,otpService);
const companyController = new CompanyController(companyService);
const jobController = new JobController(jobService);
const jobCategoryController= new JobCategoryController(jobCategoryService)

const recruiterRoute = Router();


recruiterRoute.post('/register', recruiterController.register.bind(recruiterController));
recruiterRoute.post('/login', recruiterController.login.bind(recruiterController));
recruiterRoute.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
recruiterRoute.post('/company-details/:recruiterId',authenticateToken,authorizeRole('recruiter'), companyController.createOrUpdateCompany.bind(companyController));
recruiterRoute.get('/company-details/:recruiterId',authenticateToken, authorizeRole('recruiter'), companyController.getCompanyByHrId.bind(companyController));
recruiterRoute.post('/post-job',authenticateToken,authorizeRole('recruiter'),  jobController.createJob.bind(jobController));
recruiterRoute.get('/jobs',authenticateToken,authorizeRole('recruiter'),  jobController.getRecruiterJob.bind(jobController));
recruiterRoute.get('/shortlist-jobs',authenticateToken,authorizeRole('recruiter'),  jobController.getRecruiterShortListedJob.bind(jobController));
recruiterRoute.delete('/job/:id',authenticateToken,authorizeRole('recruiter'),  jobController.deleteJob.bind(jobController));
recruiterRoute.put('/job/:id',authenticateToken,authorizeRole('recruiter'),  jobController.updateJob.bind(jobController));
recruiterRoute.get('/jobCategories',authenticateToken,authorizeRole('recruiter'), jobCategoryController.getAllJobCategories.bind(jobCategoryController));
recruiterRoute.get('/jobs/applicants',authenticateToken,authorizeRole('recruiter'),  jobController.getJobsWithApplicants.bind(jobController));
recruiterRoute.patch('/:jobId/applicants/:userId',authenticateToken,authorizeRole('recruiter'),  jobController.updateApplicationStatus.bind(jobController));

export default recruiterRoute;
