require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const db = require('./db/database');
const { seedDatabase } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server & production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 10MB limit for screenshots & test data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AI QA Assistant Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      projects: db.count('projects'),
      test_cases: db.count('test_cases'),
      requirements: db.count('requirements')
    }
  });
});

// REST API Routes (supports both direct access and serverless proxy with stripped prefix)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Serve static assets from React client build if present
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If client not built yet, return simple message
      res.json({
        message: 'AI QA Assistant API Server is running. Client will be available after build.',
        health: '/api/health',
        docs: '/api/dashboard/stats'
      });
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Auto-seed demo project if fresh database
seedDatabase(false);

let server = null;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 AI QA Assistant Server running on port ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Demo Project: CMGalaxy (12 modules initialized)`);
    console.log(`=================================================`);
  });
}

module.exports = { app, server };
