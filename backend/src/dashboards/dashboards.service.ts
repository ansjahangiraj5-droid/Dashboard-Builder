import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDashboardDto) {
    return this.prisma.dashboard.create({
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as any,
        datasetId: dto.datasetId,
        userId,
        widgets: {
          create: dto.widgets?.map((w) => ({
            type: w.type,
            title: w.title,
            config: w.config as any,
            position: w.position as any,
          })) ?? [],
        },
      },
      include: { widgets: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.dashboard.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { widgets: true, dataset: { select: { name: true, status: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: { widgets: true, dataset: { select: { id: true, name: true, status: true } } },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    if (dashboard.userId !== userId) throw new ForbiddenException();
    return dashboard;
  }

  async update(id: string, userId: string, dto: UpdateDashboardDto) {
    await this.findOne(id, userId);
    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        config: dto.config as any,
      },
      include: { widgets: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.dashboard.delete({ where: { id } });
    return { message: 'Dashboard deleted' };
  }
}
