import { Request, Response } from 'express';
import { IChatService } from '../interfaces/chat/IChatService';
import { generateZegoToken } from '../config/zego';

export class ChatController {
  constructor(private chatService: IChatService) {}

  async createChatRoom(req: Request, res: Response): Promise<void> {
    try {
      const { jobSeekerId, recruiterId } = req.body;
      const chatRoom = await this.chatService.createChatRoom(jobSeekerId, recruiterId);
      res.status(201).json(chatRoom);
    }catch (error: unknown) {
      res.status(500).json({ error: 'Failed to create chat room', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatRoomId, senderId, text ,type} = req.body;
      const message = await this.chatService.sendMessage(chatRoomId, senderId, text,type);
      res.status(201).json(message);
    }catch (error: unknown) {
      res.status(500).json({ error: 'Failed to create chat room', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatRoomId } = req.params;
      const messages = await this.chatService.getChatRoomMessages(chatRoomId);
      res.status(200).json(messages);
    }catch (error: unknown) {
      res.status(500).json({ error: 'Failed to create chat room', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getUserChatRooms(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the get user controller");
      const { userId } = req.params;
      const chatRooms = await this.chatService.getUserChatRooms(userId);
      console.log("chat rooms:", chatRooms);
      res.status(200).json(chatRooms);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Failed to create chat room', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async markMessageSeen(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const updatedMessage = await this.chatService.markMessageSeen(messageId);
      if (!updatedMessage) res.status(404).json({ error: 'Message not found' });
      res.status(200).json(updatedMessage);
    } catch (error: unknown) {
      res.status(500).json({ error: 'Failed to create chat room', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async generateTokenHandler(req: Request, res: Response): Promise<void> {
    try {
      const { roomId, userId, userName } = req.body;
      console.log("the room id is:",roomId);
      console.log("the user id is:",userId);
      console.log("the user name is:",userName);
      const token = await generateZegoToken({
        appId: Number(process.env.ZEGO_APP_ID), 
        userId: userId || crypto.randomUUID(), // Use a unique identifier
        serverSecret: process.env.ZEGO_SERVER_SECRET!,
        effectiveTimeInSeconds: 3600, // 1 hour token validity
        payload: JSON.stringify({ 
          room_id: roomId,
          user_name: userName
        })
      });

      console.log("the token of zego:",token)
  
      res.json({ token }); 
    } catch (error) {
      console.error('Token generation error:', error);
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }
}
