import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsOptional } from 'class-validator';

class CreateSessionDto {
  @IsString() datasetId: string;
  @IsOptional() @IsString() title?: string;
}

class AddMessageDto {
  @IsString() role: string;
  @IsString() content: string;
}

interface AuthRequest { user: { id: string } }

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly svc: ChatService) {}

  @Post('sessions')
  createSession(@Request() req: AuthRequest, @Body() dto: CreateSessionDto) {
    return this.svc.createSession(req.user.id, dto.datasetId, dto.title);
  }

  @Get('sessions')
  findSessions(@Request() req: AuthRequest) {
    return this.svc.findSessions(req.user.id);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.svc.getSession(id, req.user.id);
  }

  @Post('sessions/:id/messages')
  addMessage(
    @Param('id') sessionId: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.svc.addMessage(sessionId, dto.role, dto.content);
  }
}
