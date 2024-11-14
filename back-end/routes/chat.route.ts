import { Router } from "express";
import { ChatController } from '../controllers/chat.controller';
import chatRepository from "../repository/chat.repository";
import { ChatService } from "../services/chat.service";
import { authenticateToken } from "../middlewares/authmiddleware";


const chatService=new ChatService(chatRepository);
const chatController = new ChatController(chatService);

const chatRouter=Router();

chatRouter.post('/messages',authenticateToken, chatController.sendMessage);
chatRouter.get('/messages/:recruiterId/:userId',authenticateToken, chatController.getMessages);
chatRouter.put('/messages/read/:receiverId/:senderId',authenticateToken, chatController.markMessagesAsRead);

export default chatRouter;