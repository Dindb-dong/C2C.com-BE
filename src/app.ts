import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import testRoutes from './routes/test.routes';
import chatRouter from './routes/chat.routes';
import authRouter from './routes/auth.routes';
import mentorRoutes from './routes/mentor.routes';
import boardRouter from './routes/board.routes';
import newsRouter from './routes/news.routes';
import { NewsScheduler } from './schedulers/news.scheduler';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Create Express app
const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/test', testRoutes);
app.use('/api', chatRouter);
app.use('/api/auth', authRouter);
app.use('/api/mentor', mentorRoutes);
app.use('/api', boardRouter);
app.use('/api/news', newsRouter);

// Start news scheduler
const newsScheduler = new NewsScheduler();
newsScheduler.start();

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
console.log('Starting server initialization...');
console.log('Current working directory:', process.cwd());
console.log('Node environment:', process.env.NODE_ENV);
console.log('Port from env:', process.env.PORT);

console.log('Attempting to bind to port:', port);

try {
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (error: Error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// Add global error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app; 