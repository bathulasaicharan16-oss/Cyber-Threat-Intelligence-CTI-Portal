import express from 'express';
import { generateReport, exportReportPDF, listReports, getReportDetails } from '../controllers/reportController.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Generate report is restricted to TI_RESEARCHER per Activity Diagram
router.post('/generate', authenticate, authorizeRole(['TI_RESEARCHER']), generateReport);
router.get('/', authenticate, listReports);
router.get('/:reportId', authenticate, getReportDetails);
router.get('/:reportId/export', exportReportPDF); // Allow download

export default router;
