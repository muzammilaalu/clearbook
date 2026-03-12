// src/routes/authRoutes.js

import { Router } from 'express';
import { login, callback, status, logout } from '../controllers/authController.js';

const router = Router();

router.get('/login',    login);
router.get('/callback', callback);
router.get('/status',   status);
router.get('/logout',   logout);

export default router;