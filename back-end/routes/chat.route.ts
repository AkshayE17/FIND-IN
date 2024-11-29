import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';
import messageRepository from '../repository/message.repository';
import chatRoomRepository from '../repository/chatroom.repository';


const chatService = new ChatService(chatRoomRepository, messageRepository);
const chatRouter = express.Router();
const chatController = new ChatController(chatService);

chatRouter.post('/create-room', chatController.createChatRoom.bind(chatController));
chatRouter.post('/send-message', chatController.sendMessage.bind(chatController));
chatRouter.get('/:chatRoomId/messages', chatController.getMessages.bind(chatController));
chatRouter.patch('/message/:messageId/seen', chatController.markMessageSeen.bind(chatController));
chatRouter.get('/user-rooms/:userId', chatController.getUserChatRooms.bind(chatController));
chatRouter.get('/messages/:chatRoomId', chatController.getMessages.bind(chatController));
chatRouter.post('/generate-token', chatController.generateTokenHandler.bind(chatController));


export default chatRouter;
  