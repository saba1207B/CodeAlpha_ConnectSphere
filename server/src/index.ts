import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { config } from './config.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();
const server = http.createServer(app);

// Security & Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow WebRTC and dynamic media streams
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

// Static files (uploads)
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}
app.use('/uploads', express.static(config.uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'ConnectSphere',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if built in production
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(errorMiddleware);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

setupSocketHandlers(io);

// Start server
server.listen(config.port, () => {
  console.log(`==============================================`);
  console.log(`—CONNECTSPHERE Real-Time Media Engine`);
  console.log(`Port: ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Client URL: ${config.clientUrl}`);
  console.log(`==============================================`);
});
