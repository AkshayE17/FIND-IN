import { Router } from "express";
import { RecruiterController } from "../controllers/recruiter.controller";

const recruiterController=new RecruiterController();
const recruiterRoute=Router();

recruiterRoute.post('/register',recruiterController.register);
recruiterRoute.post('/login',recruiterController.login);
recruiterRoute.post('/verify-otp',recruiterController.verifyOtp);

export default recruiterRoute;