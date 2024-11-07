import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { JobCategoryController } from '../controllers/jobCategory.controller';
import { AdminService } from '../services/admin.service';
import { JobCategoryService } from '../services/jobcategory.service';
import AdminRepository from '../repository/admin.repository'; 
import JobCategoryRepository from '../repository/jobCategory.repository';


const adminService = new AdminService(AdminRepository);
const jobCategoryService = new JobCategoryService(JobCategoryRepository);


const adminController = new AdminController(adminService);
const jobCategoryController = new JobCategoryController(jobCategoryService);

const adminRouter = Router();


adminRouter.post('/login', adminController.login.bind(adminController));
adminRouter.post('/register', adminController.createAdmin.bind(adminController));
adminRouter.get('/pending', adminController.getPendingRecruiters.bind(adminController));
adminRouter.put('/approve', adminController.approveRecruiter.bind(adminController));
adminRouter.put('/reject', adminController.rejectRecruiter.bind(adminController));
adminRouter.get('/recruiters', adminController.getRecruiters.bind(adminController));
adminRouter.get('/users', adminController.getUsers.bind(adminController));
adminRouter.get('/job-categories', jobCategoryController.getJobCategories.bind(jobCategoryController));
adminRouter.post('/job-category', jobCategoryController.createJobCategory.bind(jobCategoryController));
adminRouter.put('/job-category/:id',jobCategoryController.updateJobCategory.bind(jobCategoryController));
adminRouter.delete('/job-category/:id',jobCategoryController.deleteJobCategory.bind(jobCategoryController));
adminRouter.put('/recruiter-block', adminController.blockOrUnblockRecruiter.bind(adminController));
adminRouter.put('/user-block', adminController.blockOrUnblockUser.bind(adminController));

export default adminRouter;
