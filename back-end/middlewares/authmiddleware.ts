import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the access token
    const refreshToken = req.cookies?.userRefreshToken || req.cookies?.refreshToken || req.cookies?.adminRefreshToken;
    const role = req.headers['role'];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing.' });
    }

    try {
        // Verify the access token
        const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        (req as any).user = user;
        (req as any).role = role;
        return next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            console.log('Access token expired. Attempting to use refresh token...');
            
            if (!refreshToken) {
                return res.status(401).json({ message: 'Access token expired and no refresh token provided.' });
            }

            try {
                // Verify the refresh token
                const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

                // Generate a new access token
                const newAccessToken = jwt.sign(
                    { id: payload.id, email: payload.email, role: payload.role },
                    process.env.JWT_ACCESS_SECRET!,
                    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '45m' }
                );

                // Set the new access token in the response headers
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.headers['authorization'] = `Bearer ${newAccessToken}`;

                console.log('New access token generated:', newAccessToken);

                // Proceed with the request
                const user = jwt.verify(newAccessToken, process.env.JWT_ACCESS_SECRET!);
                (req as any).user = user;
                (req as any).role = role;
                return next();
            } catch (refreshError) {
                console.error('Error verifying refresh token:', refreshError);
                return res.status(403).json({ message: 'Invalid or expired refresh token.' });
            }
        } else {
            console.error('Error verifying access token:', err);
            return res.status(403).json({ message: 'Invalid access token.' });
        }
    }
};
