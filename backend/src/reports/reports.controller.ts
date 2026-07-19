import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsObject } from 'class-validator';

class CreateReportDto {
  @IsString() name: string;
  @IsString() format: string;
  @IsString() datasetId: string;
  @IsObject() config: Record<string, unknown>;
}

interface AuthRequest { user: { id: string } }

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.svc.findAll(req.user.id);
  }

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateReportDto) {
    return this.svc.create(req.user.id, dto);
  }
}
