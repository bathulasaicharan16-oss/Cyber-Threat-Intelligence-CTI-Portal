import express from 'express';
import { getAlerts, markAlertRead, dismissAlert, createManualAlert } from '../controllers/alertController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getAlerts);
router.put('/:alertId/read', authenticate, markAlertRead);
router.put('/:alertId/dismiss', authenticate, dismissAlert);
router.post('/', authenticate, createManualAlert);

export default router;
