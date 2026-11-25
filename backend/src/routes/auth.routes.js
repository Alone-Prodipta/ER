import { Router } from 'express';
import { currentUser, login, logout, register } from '../controllers/auth.controllers.js';
import requireAuth from '../middlewares/requireAuth.middlewares.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, currentUser);

export default router;
