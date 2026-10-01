require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const responseHandler = require('./middleware/responseHandler');
const db = require('./db/database');
const { seedDatabase } = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS configuration supporting Vercel frontend, preview branches, and localhost
const allowedOrigins = [
  'https://inspectron-ai-qa.vercel.app',
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    // Allow external API callers
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

// Structured request logging for production observability
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/api/health') return next();
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Body parser with 10MB limit for screenshots & test data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Standardized Response Format Middleware ({ success: true, data: ..., message: ... })
app.use(responseHandler);

// Production Health Check & Liveness Probe (GET /health and GET /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'Inspectron Backend API',
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: 'CONNECTED',
      projects: db.count('projects'),
      test_cases: db.count('test_cases'),
      requirements: db.count('requirements')
    },
    ai_service: {
      provider: process.env.AI_PROVIDER || 'hybrid',
      gemini_configured: !!process.env.GEMINI_API_KEY
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
    console.log(`   Demo Project: Inspectron (12 modules initialized)`);
    console.log(`=================================================`);
  });
}

module.exports = { app, server };
