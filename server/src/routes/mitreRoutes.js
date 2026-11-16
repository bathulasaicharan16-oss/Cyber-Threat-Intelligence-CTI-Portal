import express from 'express';
import { getMitreMatrix, mapThreat } from '../controllers/mitreController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/matrix', authenticate, getMitreMatrix);
router.post('/map', authenticate, mapThreat);

export default router;
