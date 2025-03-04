import {Router, Request, Response} from 'express';
import UserModel from '../models/user.model';
import jwt from 'jsonwebtoken';
import {AuthRequest, verifyToken} from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */
router.post('/register', async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, firstName, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const newUser = new UserModel({ name, firstName, email, password });
        await newUser.save();

        return res.status(201).json({
            message: 'User created successfully.',
            user: { name, firstName, email }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req: Request, res: Response):Promise<any> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secretkey', {
            expiresIn: '1h',
        });

        return res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/me', verifyToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as AuthRequest).userId;
        const user = await UserModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;