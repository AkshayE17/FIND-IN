import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import jwt from 'jsonwebtoken';



const userService = new UserService();

export class UserController {

    // Create a new user
    async createUser(req: Request, res: Response) {
        try {
            
            await userService.registerUser(req.body);
            res.status(201).json({ message: 'User created. Please verify your email by entering the OTP sent to your email.' });
        }
        catch (error: unknown) {   
            console.error('Error during user registration:', error);
            
            let errorMessage: string;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);   
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    // Update an existing user
    async updateUser(req: Request, res: Response) {
        const userId = req.params.id;
        const updatedData = req.body; 
        try {
            const updatedUser = await userService.updateUser(userId, updatedData);
            if (updatedUser) {
                res.json(updatedUser);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Error updating user', error });
        }
    }
    

    //verify otp
    async verifyOtp(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;
            await userService.verifyOtp(email, otp);
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
    

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken } = await userService.loginUser(email, password);
    
            // Set refresh token in a cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
    
            res.status(200).json({ accessToken });
        } catch (error) {
            console.error('Error during login:', error);
            if (error instanceof Error) {
                res.status(400).json({ message: error.message }); // Ensure the error message is returned
            } else {
                res.status(500).json({ message: 'An unknown error occurred.' });
            }
        }
    }
    

   //refreshtoken
    async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    console.log("refresh token:", refreshToken);

    if (!refreshToken) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
        if (err || !user) return res.sendStatus(403); 

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
        res.json({ accessToken });
    });
    }

}
