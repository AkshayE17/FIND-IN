import { RecruiterRepository } from '../repository/recruiter.repository';
import { OtpRepository } from '../repository/otp.repository';
import nodemailer from 'nodemailer'
import { IRecruiter } from '../models/Recruiter';
import bcrypt from 'bcrypt';
import  jwt  from 'jsonwebtoken';



export class RecruiterService {

  private otpRepository:OtpRepository;
  private recruiterRepository:RecruiterRepository;

  constructor(otpRepository:OtpRepository,recruiterRepository:RecruiterRepository){
    this.otpRepository=otpRepository;
    this.recruiterRepository=recruiterRepository;
  }

  async registerRecruiter(recruiterData: IRecruiter){
    console.log("entering the register recruiter service")
    const existingRecruiter = await this.recruiterRepository.findRecruiterByEmail(recruiterData.email);

    if (existingRecruiter) {
      throw new Error('Recruiter with this email already exists.');
    }

  
    const hashedPassword = await bcrypt.hash(recruiterData.password, 10);
    recruiterData.password = hashedPassword;

    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    console.log("New otp is :",otp);

    const newRecruiter = await this.recruiterRepository.createRecruiter(recruiterData);

    console.log("new recruiter data is:",recruiterData);

        await this.otpRepository.createOtp(newRecruiter.email.toString(), otp);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions: nodemailer.SendMailOptions = {   
        from: process.env.EMAIL_USER,
        to: newRecruiter.email.toString(),
        subject: 'Your OTP for Email Verification',
        text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return newRecruiter;
  }

      //verify otp
      async verifyOtp(email: string, otp: number) {
        const otpEntry = await this.otpRepository.findOtp(email, otp);
        if (!otpEntry) {
            throw new Error('Invalid OTP or OTP has expired.');
        }

        const recruiter = await this.recruiterRepository.findRecruiterByEmail(email);
        if (!recruiter) {
            throw new Error('User not found.');
        }

        recruiter.isVerified = true;
        await recruiter.save();
        await this.otpRepository.deleteOtp(otpEntry.email);
        return recruiter;
    }

    //login recruite
  async loginRecruiter(email: string, password: string){
    const recruiter = await this.recruiterRepository.findRecruiterByEmail(email);

    if (!recruiter) {
      throw new Error('User not found');
    }

    if (recruiter.isApproved==='Pending') {
      throw new Error('Your account is pending approval from the admin.');
    }else if(recruiter.isApproved==='Rejected'){
      throw new Error('Your account has been rejected from the admin.');
    }

    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      throw new Error('Invalid password');
    }

    const accessToken = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    
    return {recruiter, accessToken, refreshToken };
  }

  
}
