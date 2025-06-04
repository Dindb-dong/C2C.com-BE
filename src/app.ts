import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import testRoutes from './routes/test.routes';
import chatRouter from './routes/chat';
import authRouter from './routes/auth.routes';
import mentorRoutes from './routes/mentor.routes';
import boardRouter from './routes/board.routes';
import newsRouter from './routes/news.routes';
import { NewsScheduler } from './schedulers/news.scheduler';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
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
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 