import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server } from 'socket.io';
import http from 'http';

import { ChatService } from './services/chat.service';
import chatRoomRepository from './repository/chatroom.repository';
import messageRepository from './repository/message.repository';

// Import configurations
import connectDB from './config/db';
import logger from './config/logger';

// Import routes
import userRoute from './routes/user.route';
import recruiterRoute from './routes/recruiter.route';
import adminRouter from './routes/admin.route';
import chatroute from './routes/chat.route';


dotenv.config();

const router = express.Router();

class App {
  public app: Application;
  public server: http.Server;
  public io: Server;
  private readonly port: string | number;
  private readonly clientUrl: string = 'http://localhost:4200';

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = process.env.PORT || 3333;
    

    this.io = new Server(this.server, {
      cors: {
        origin: this.clientUrl,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      allowEIO3: true, 
      transports: ['websocket', 'polling'] 
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeDatabase();
    this.setupSocketEvents();
  }
  

  private initializeMiddlewares(): void {
    // Body parser middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS configuration for HTTP requests
    this.app.use(cors({
      origin: this.clientUrl,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Role'] 
    }));
    

    // Cookie parser
    this.app.use(cookieParser());

    // Logging configuration
    const morganFormat = ':method :url :status :response-time ms';
    this.app.use(morgan('combined'));
    this.app.use(
      morgan(morganFormat, {
        stream: {
          write: (message: string) => {
            const logObject = {
              method: message.split(' ')[0],
              url: message.split(' ')[1],
              status: message.split(' ')[2],
              responseTime: message.split(' ')[3],
            };
            logger.info(JSON.stringify(logObject));
          },
        },
      })
    );
  }


  private initializeRoutes(): void {
    this.app.use('/user', userRoute);
    this.app.use('/recruiter', recruiterRoute);
    this.app.use('/admin', adminRouter);
    this.app.use('/chat',chatroute)

  }

  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }
  private connectedUsers: Set<string> = new Set();
  private setupSocketEvents(): void {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      

      // Join chat room
      socket.on('joinRoom', ({ chatRoomId }) => {
        socket.join(chatRoomId);
        console.log(`User joined room: ${chatRoomId}`);
      });

      socket.on('userOnline', (userId) => {
        this.connectedUsers.add(userId);
        socket.broadcast.emit('userStatusChanged', { userId, status: 'online' });
      });
      // Handle new message
      socket.on('newMessage', async ({ chatRoomId, senderId, text,type }) => {
        try {
          const chatService = new ChatService(chatRoomRepository, messageRepository);
          const message = await chatService.sendMessage(chatRoomId, senderId, text,type);

          // Emit message to room participants
          this.io.to(chatRoomId).emit('messageReceived', message);
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      // Handle typing event
      socket.on('typing', ({ chatRoomId, senderId }) => {
        socket.to(chatRoomId).emit('userTyping', { senderId });
      });

      // Handle message seen event
      socket.on('markAsSeen', async ({ messageId }) => {
        try {
          const chatService = new ChatService(chatRoomRepository, messageRepository);
          const updatedMessage = await chatService.markMessageSeen(messageId);
          this.io.emit('messageSeen', updatedMessage);
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId) {
          this.connectedUsers.delete(userId);
          socket.broadcast.emit('userStatusChanged', { userId, status: 'offline' });
        }
      });
    });
  }
  

  public listen(): void {
    this.server.listen(this.port, () => {
      logger.info(`Server running on http://localhost:${this.port}`);
    });

    // Handle server errors
    this.server.on('error', (error) => {
      logger.error('Server error:', error);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      process.exit(1);
    });

  }
}

// Initialize and start the server
const app = new App();
app.listen();

export default app;