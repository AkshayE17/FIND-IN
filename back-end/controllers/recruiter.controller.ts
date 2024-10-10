import { Request, Response } from 'express';
import { RecruiterService } from '../services/recruiter.service';

const recruiterService=new RecruiterService();

export class RecruiterController {

// Register a new recruiter
async register(req: Request, res: Response): Promise<void> {
  try {
    console.log("entering register constroller")
    const recruiter = await recruiterService.registerRecruiter(req.body);
    res.status(201).json({ message: 'Recruiter registered successfully', recruiter });
  } catch (error: any) {
    console.error('Error in registering recruiter:', error); 
    res.status(400).json({ message: error?.message || 'An error occurred during registration' });
  }
}




// Authenticate recruiter (login)
async login(req: Request, res: Response): Promise<void> {
  try {
    const recruiter = await recruiterService.loginRecruiter(req.body.email, req.body.password);
    res.status(200).json({ message: 'Login successful', recruiter });
  } catch (error: any) {
    console.error('Error in registering recruiter:', error); 
    res.status(400).json({ message: error?.message || 'Invalid email or password' });
  }
}


//verify otp
async verifyOtp(req: Request, res: Response) {
  try {
      const { email, otp } = req.body;
      await recruiterService.verifyOtp(email, otp);
      res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
      console.error('Error during OTP verification:', error);
      if (error instanceof Error) {
          res.status(500).json({ message: error.message });
      } else {
          res.status(500).json({ message: 'An unknown error occurred.' });
      }
  }
}

}
  