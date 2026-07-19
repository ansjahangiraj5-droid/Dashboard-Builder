import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        company: true,
        jobTitle: true,
        timezone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { datasets: true, dashboards: true, reports: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, requesterId: string, dto: UpdateUserDto) {
    if (id !== requesterId) throw new ForbiddenException();

    const data: Record<string, unknown> = {
      name: dto.name,
      company: dto.company,
      jobTitle: dto.jobTitle,
      timezone: dto.timezone,
    };

    if (dto.password) {
      data.passwordHash = await argon2.hash(dto.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        company: true,
        jobTitle: true,
        timezone: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async getStats(userId: string) {
    const [datasets, dashboards, insights, reports] = await Promise.all([
      this.prisma.dataset.count({ where: { userId } }),
      this.prisma.dashboard.count({ where: { userId } }),
      this.prisma.insight.count({ where: { userId } }),
      this.prisma.report.count({ where: { userId } }),
    ]);
    return { datasets, dashboards, insights, reports };
  }
}
