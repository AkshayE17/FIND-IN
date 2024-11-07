
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired access token' });

        (req as any).user = user;
        next();  
    });
};
