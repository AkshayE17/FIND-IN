import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 


    const role = req.headers['role'];

    console.log("token in authenticateToken:", token);
    console.log("role in authenticateToken:", role); 
    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired access token' });


        (req as any).user = user;
        (req as any).role = role;

        next();  
    });
};
