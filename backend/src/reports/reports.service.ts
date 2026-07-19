import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { dataset: { select: { name: true } } },
    });
  }

  async create(userId: string, data: {
    name: string; format: string; config: object; datasetId: string;
  }) {
    return this.prisma.report.create({
      data: {
        name: data.name,
        format: data.format as any,
        config: data.config,
        datasetId: data.datasetId,
        userId,
      },
    });
  }
}
