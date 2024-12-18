import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userRepository from '../repository/user.repository';
import recruiterRepository from '../repository/recruiter.repository';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const refreshToken = req.cookies?.userRefreshToken || req.cookies?.refreshToken || req.cookies?.adminRefreshToken;
    const role = req.headers['role'];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing.' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        if (role === 'user') {
            const user = await userRepository.findById(decoded.id);
            if (user?.isBlocked) {
                return res.status(403).json({ 
                    message: 'User account is blocked', 
                    shouldLogout: true 
                });
            }
        }

        if (role === 'recruiter') {
            const recruiter = await recruiterRepository.findById(decoded.id)
            if (recruiter?.isBlocked) {
                return res.status(403).json({ 
                    message: 'Recruiter account is blocked', 
                    shouldLogout: true 
                });
            }
        }

        (req as any).user = decoded;
        (req as any).role = role;
        return next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            if (!refreshToken) {
                return res.status(401).json({ message: 'Access token expired and no refresh token provided.' });
            }

            try {
                const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

                // Additional blocking check for refresh token
                if (payload.role === 'user') {
                    const user = await userRepository.findByEmail(payload.email);
                    if (user?.isBlocked) {
                        return res.status(403).json({ 
                            message: 'User account is blocked', 
                            shouldLogout: true 
                        });
                    }
                }

                if (payload.role === 'recruiter') {
                    const recruiter = await recruiterRepository.findRecruiterByEmail(payload.email);
                    if (recruiter?.isBlocked) {
                        return res.status(403).json({ 
                            message: 'Recruiter account is blocked', 
                            shouldLogout: true 
                        });
                    }
                }

                const newAccessToken = jwt.sign(
                    { id: payload.id, email: payload.email, role: payload.role },
                    process.env.JWT_ACCESS_SECRET!,
                    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '45m' }
                );

                // Set the new access token in the response headers
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.headers['authorization'] = `Bearer ${newAccessToken}`;

                const user = jwt.verify(newAccessToken, process.env.JWT_ACCESS_SECRET!);
                (req as any).user = user;
                (req as any).role = payload.role;
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