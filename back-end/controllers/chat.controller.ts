import { Request, Response } from 'express';
import { IChatController } from '../interfaces/chat/IChatController';
import { IChatService } from '../interfaces/chat/IChatService';

export class ChatController implements IChatController {
 
  constructor( private _chatService: IChatService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const message = await this._chatService.sendMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { recruiterId, userId } = req.params;
      const messages = await this._chatService.getMessages(recruiterId, userId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { receiverId, senderId } = req.params;
      await this._chatService.markMessagesAsRead(receiverId, senderId);
      res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
}
