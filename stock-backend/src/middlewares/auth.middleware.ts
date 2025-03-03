// stock-backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from "../models/user.model";

export interface AuthRequest extends Request {
    userId: string;
}

declare global {
    namespace Express {
        interface Request {
            user: any;
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey') as { userId: string };
        (req as AuthRequest).userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
}

export function authenticateUser(req: Request, res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'Access denied. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Add more robust token validation
        if (!token) {
            res.status(401).json({ error: 'Invalid authorization format' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey') as { userId: string };

            // Add debug logging
            console.log('Decoded token:', decoded);

            if (!decoded.userId) {
                res.status(401).json({ error: 'Invalid token structure' });
                return;
            }

            UserModel.findById(decoded.userId)
                .then(user => {
                    if (!user) {
                        console.log('User not found with ID:', decoded.userId);
                        res.status(404).json({ error: 'User not found' });
                        return;
                    }

                    // Attach user to request
                    req.user = user;

                    // Initialize savedStocks if undefined
                    if (!req.user.savedStocks) {
                        req.user.savedStocks = [];
                    }

                    next();
                })
                .catch(err => {
                    console.error('Database error finding user:', err);
                    res.status(500).json({ error: 'Database error' });
                });
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}