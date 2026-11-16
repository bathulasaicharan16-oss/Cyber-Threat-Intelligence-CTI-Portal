import express from 'express';
import { loadWidgets } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/widgets', authenticate, loadWidgets);

export default router;
