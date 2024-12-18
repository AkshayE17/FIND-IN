import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import UserRepository from "../repository/user.repository";
import jobRepository from "../repository/job.repository";
import { JobController } from "../controllers/job.controller";
import { JobService } from "../services/job.service";
import companyRepository from "../repository/company.repository";
import { OtpService } from "../services/otp.service";
import otpRepository from "../repository/otp.repository";
import { ProfessionalDetailsController } from "../controllers/professionalDetails.controller";
import { ProfessionalDetailsService } from "../services/professionalDetails.service";
import professionalDetailsRepository from "../repository/professionalDetails.repository";
import { authenticateToken } from "../middlewares/authmiddleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { JobCategoryController } from "../controllers/jobCategory.controller";
import { JobCategoryService } from "../services/jobcategory.service";
import jobCategoryRepository from "../repository/jobCategory.repository";

const userService = new UserService(UserRepository);
const otpService= new OtpService(otpRepository);
const jobService=new JobService(jobRepository,companyRepository);
const jobCategoryService=new JobCategoryService(jobCategoryRepository);
const jobCategoryController=new JobCategoryController(jobCategoryService);
const professionalDetailsService = new ProfessionalDetailsService(professionalDetailsRepository);
const userController = new UserController(userService,otpService);
const jobController=new JobController(jobService);
const professionalDetailsController=new ProfessionalDetailsController(professionalDetailsService);
  
const userRouter = Router();


userRouter.post('/register',userController.createUser.bind(userController));
userRouter.get('/jobs',jobController.getAllJobs.bind(jobController));
userRouter.get('/jobCategories', jobCategoryController.getAllJobCategories.bind(jobCategoryController));
userRouter.get('/:userId',userController.getUser.bind(userController));
userRouter.post('/login', userController.login.bind(userController));
userRouter.put('/profile',authenticateToken,authorizeRole('user'), userController.updateUser.bind(userController));
userRouter.post('/verify-otp',userController.verifyOtp.bind(userController));
userRouter.get('/job/:id',authorizeRole('user'),jobController.getJobById.bind(jobController));
userRouter.post('/job/:jobId/apply',authenticateToken,authorizeRole('user'), jobController.applyForJob.bind(jobController));
userRouter.get('/applied/:userId',authenticateToken,authorizeRole('user'), jobController.appliedJobs.bind(jobController));
userRouter.get('/shortListed/:userId',authenticateToken,authorizeRole('user'), jobController.shortListedJobs.bind(jobController));
userRouter.post('/refresh-token',userController.refreshToken.bind(userController));
userRouter.put('/professional-details/:id',authenticateToken,authorizeRole('user'),  professionalDetailsController.update.bind(professionalDetailsController));
userRouter.get('/professional-details/:id',authenticateToken,authorizeRole('user'), professionalDetailsController.getByUserId.bind(professionalDetailsController));
userRouter.post('/professional-details/:userId',authenticateToken,authorizeRole('user'),  professionalDetailsController.create.bind(professionalDetailsController));
userRouter.patch('/change-password/:userId',authenticateToken,authorizeRole('user'),userController.changePassword.bind(userController));
userRouter.post('/check-mobile', userController.checkMobileExists.bind(userController));
  
export default userRouter;
