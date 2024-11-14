import { NextFunction, Request, Response } from "express";

export const authorizeRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.headers['role'];
      
    console.log(" role in authorizeRole:", role);
      
      if (role !== requiredRole) {
        res.status(403);
        res.json({ message: 'Access denied' });
      }

      next();
  };
};
