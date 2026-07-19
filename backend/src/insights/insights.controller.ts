import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest { user: { id: string } }

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly svc: InsightsService) {}

  @Get()
  findAll(@Request() req: AuthRequest, @Query('datasetId') datasetId?: string) {
    return this.svc.findAll(req.user.id, datasetId);
  }
}
