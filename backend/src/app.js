import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import diagramRoutes from './routes/diagram.routes.js';
import errorHandler from './middlewares/errorHandler.middlewares.js';

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/diagrams', diagramRoutes);
app.use((req, res) => res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` }));
app.use(errorHandler);

export default app;
