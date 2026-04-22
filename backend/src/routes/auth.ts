import { Router } from 'express';
import { signup, login, getUserData } from '../controllers/authController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', authMiddleware, getUserData);

export default router;
