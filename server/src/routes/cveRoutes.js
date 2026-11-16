import express from 'express';
import { searchCVE, getCVEDetails, triggerCVEAlert } from '../controllers/cveController.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Search CVEs (Accessible to all authenticated SOC roles)
router.get('/search', authenticate, searchCVE);
router.get('/:cveId', authenticate, getCVEDetails);
router.post('/:cveId/alert', authenticate, triggerCVEAlert);

export default router;
