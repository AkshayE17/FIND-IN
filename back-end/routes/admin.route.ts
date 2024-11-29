import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { JobCategoryController } from '../controllers/jobCategory.controller';
import { AdminService } from '../services/admin.service';
import { JobCategoryService } from '../services/jobcategory.service';
import AdminRepository from '../repository/admin.repository'; 
import JobCategoryRepository from '../repository/jobCategory.repository';
import { authenticateToken } from '../middlewares/authmiddleware';
import { authorizeRole } from '../middlewares/authorizeRole';


const adminService = new AdminService(AdminRepository);
const jobCategoryService = new JobCategoryService(JobCategoryRepository);


const adminController = new AdminController(adminService);
const jobCategoryController = new JobCategoryController(jobCategoryService);

const adminRouter = Router();


adminRouter.post('/login', adminController.login.bind(adminController));
adminRouter.post('/register', adminController.createAdmin.bind(adminController));
adminRouter.get('/pending',authenticateToken,authorizeRole('admin'), adminController.getPendingRecruiters.bind(adminController));
adminRouter.put('/approve',authenticateToken,authorizeRole('admin'), adminController.approveRecruiter.bind(adminController));
adminRouter.put('/reject', authenticateToken,authorizeRole('admin'),adminController.rejectRecruiter.bind(adminController));
adminRouter.get('/recruiters',authenticateToken,authorizeRole('admin'), adminController.getRecruiters.bind(adminController));
adminRouter.get('/users',authenticateToken,authorizeRole('admin'), adminController.getUsers.bind(adminController));
adminRouter.get('/job-categories',authenticateToken,authorizeRole('admin'), jobCategoryController.getJobCategories.bind(jobCategoryController));
adminRouter.post('/job-category',authenticateToken,authorizeRole('admin'), jobCategoryController.createJobCategory.bind(jobCategoryController));
adminRouter.put('/job-category/:id',authenticateToken,authorizeRole('admin'),jobCategoryController.updateJobCategory.bind(jobCategoryController));
adminRouter.delete('/job-category/:id',authenticateToken,authorizeRole('admin'),jobCategoryController.deleteJobCategory.bind(jobCategoryController));
adminRouter.put('/recruiter-block',authenticateToken,authorizeRole('admin'), adminController.blockOrUnblockRecruiter.bind(adminController));
adminRouter.put('/user-block',authenticateToken,authorizeRole('admin'), adminController.blockOrUnblockUser.bind(adminController));
adminRouter.post('/generate-upload-url', adminController.generatePredefinedUrl.bind(adminController));
adminRouter.get('/dashboard/statistics', authenticateToken, authorizeRole('admin'), adminController.getDashboardStatistics.bind(adminController));
adminRouter.get('/recent-jobs',authenticateToken,authorizeRole('admin'), adminController.getRecentJobs.bind(adminController));
adminRouter.get('/report',authenticateToken,authorizeRole('admin'), adminController.generateJobReport.bind(adminController));
export default adminRouter;
