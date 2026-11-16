import express from 'express';
import { investigateIOC, getIOCHistory } from '../controllers/iocController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/investigate', authenticate, investigateIOC);
router.get('/history', authenticate, getIOCHistory);

export default router;
