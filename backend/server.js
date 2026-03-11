import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// ── Route imports ────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import startupsRoutes from './routes/startupsRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import launchpadRoutes from './routes/launchpadRoutes.js';
import resourcesRoutes from './routes/resourcesRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';
import dashboardRoutes from './routes/dashboard.js';

// ── Middleware imports ───────────────────────────
import errorHandler from './middleware/errorHandler.js';

// ── App setup ────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.use("/api/dashboard", dashboardRoutes)
// ── Health check ─────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/startups', startupsRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/launchpad', launchpadRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/insights', insightsRoutes);

// ── 404 fallback ─────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler (must be last) ──────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FoundersKick API running → http://localhost:${PORT}`);
  console.log(`   Health check            → http://localhost:${PORT}/api/health\n`);
});

export default app;
