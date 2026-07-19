import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest { user: { id: string } }

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly svc: DashboardsService) {}

  @Post()
  create(@Request() req: AuthRequest, @Body() dto: CreateDashboardDto) {
    return this.svc.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.svc.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: AuthRequest, @Body() dto: UpdateDashboardDto) {
    return this.svc.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.remove(id, req.user.id);
  }
}
