import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, datasetId: string, title?: string) {
    return this.prisma.chatSession.create({
      data: { userId, datasetId, title },
      include: { messages: true },
    });
  }

  async findSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        dataset: { select: { name: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });
  }

  async getSession(id: string, userId: string) {
    return this.prisma.chatSession.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async addMessage(sessionId: string, role: string, content: string, metadata?: object) {
    const message = await this.prisma.chatMessage.create({
      data: { sessionId, role, content, metadata },
    });
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
    return message;
  }
}
