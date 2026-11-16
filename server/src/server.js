import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { seedDatabase } from './data/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import cveRoutes from './routes/cveRoutes.js';
import iocRoutes from './routes/iocRoutes.js';
import malwareRoutes from './routes/malwareRoutes.js';
import mitreRoutes from './routes/mitreRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    project: 'Cyber Threat Intelligence Portal',
    course: 'Software Engineering Project (BCS 502)',
    institution: 'Amity University Rajasthan',
    authors: [
      { name: 'B. Sai Charan', enrollment: 'A20405224070' },
      { name: 'D. Ganesh Ravichandu', enrollment: 'A20405224296' },
    ],
    supervisor: 'Dr. Deepti Saxena',
    academicYear: '2026-2027',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cve', cveRoutes);
app.use('/api/ioc', iocRoutes);
app.use('/api/malware', malwareRoutes);
app.use('/api/mitre', mitreRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve compiled React frontend if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving compiled React SPA from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` CTI Portal Web Application running on http://localhost:${PORT}`);
      console.log(` Software Engineering Project | BCS 502`);
      console.log(` Amity University Rajasthan (Academic Year 2026-2027)`);
      console.log(` Guided by Dr. Deepti Saxena`);
      console.log(` Authors: B. Sai Charan & D. Ganesh Ravichandu`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
