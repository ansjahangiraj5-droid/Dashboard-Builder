import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class DatasetsService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) mkdirSync(this.uploadDir, { recursive: true });
  }

  async create(
    userId: string,
    file: Express.Multer.File,
    body: { name?: string; description?: string },
  ) {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type. Allowed: CSV, XLSX, JSON');
    }

    const dataset = await this.prisma.dataset.create({
      data: {
        name: body.name ?? file.originalname,
        description: body.description,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storagePath: file.path,
        userId,
        status: 'PENDING',
      },
    });
    return dataset;
  }

  async findAll(userId: string) {
    return this.prisma.dataset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true,
        rowCount: true,
        columnCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const dataset = await this.prisma.dataset.findUnique({ where: { id } });
    if (!dataset) throw new NotFoundException('Dataset not found');
    if (dataset.userId !== userId) throw new ForbiddenException();
    return dataset;
  }

  async remove(id: string, userId: string) {
    const dataset = await this.findOne(id, userId);
    if (existsSync(dataset.storagePath)) {
      unlinkSync(dataset.storagePath);
    }
    await this.prisma.dataset.delete({ where: { id } });
    return { message: 'Dataset deleted' };
  }

  async updateStatus(
    id: string,
    status: string,
    meta: { rowCount?: number; columnCount?: number; schema?: object; previewData?: object },
  ) {
    return this.prisma.dataset.update({
      where: { id },
      data: { status: status as any, ...meta },
    });
  }
}
