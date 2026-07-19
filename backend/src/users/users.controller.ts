import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.id);
  }

  @Get('me/stats')
  getStats(@Request() req: AuthRequest) {
    return this.usersService.getStats(req.user.id);
  }

  @Patch(':id')
  updateProfile(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, req.user.id, dto);
  }
}
