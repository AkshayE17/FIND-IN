
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
const adminController=new AdminController();

const adminRouter = Router();

adminRouter.post('/login', adminController.login);
adminRouter.post('/register',adminController.createAdmin);
adminRouter.get('/pending',adminController.getPendingRecruiters);
adminRouter.put('/approve',adminController.approveRecruiter);
adminRouter.put('/reject',adminController.rejectRecruiter);
adminRouter.get('/recruiters',adminController.getRecruiters);
adminRouter.get('/users',adminController.getAllUsers);

export default adminRouter;
