import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, datasetId?: string) {
    return this.prisma.insight.findMany({
      where: { userId, ...(datasetId && { datasetId }) },
      orderBy: { createdAt: 'desc' },
      include: { dataset: { select: { name: true } } },
    });
  }

  async create(userId: string, data: {
    type: string; title: string; summary: string;
    details: object; confidence: number; datasetId: string;
  }) {
    return this.prisma.insight.create({
      data: {
        type: data.type as any,
        title: data.title,
        summary: data.summary,
        details: data.details,
        confidence: data.confidence,
        datasetId: data.datasetId,
        userId,
      },
    });
  }
}
