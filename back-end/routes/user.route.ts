import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userController=new UserController();
const userRoute=Router();

userRoute.post('/register',userController.createUser);
userRoute.post('/verify-otp',userController.verifyOtp);
userRoute.post('/login',userController.login);

export default userRoute;

